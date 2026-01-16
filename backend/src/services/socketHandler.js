const matchMaker = require('./matchMaker');
const { EVENTS } = require('../utils/constants');
const db = require('../config/db');

const activeRooms = new Map();

const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 1000;
const MAX_MSGS_PER_WINDOW = 5;

module.exports = (io) => {
    io.on(EVENTS.CONNECT, (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on(EVENTS.SEARCH_PARTNER, async () => {
            if (socket.rooms.size > 1) {
                const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
                if (rooms.length > 0) {
                    console.warn(`User ${socket.id} attempted search while in room`);
                    return;
                }
            }

            matchMaker.addUser(socket.id);

            const match = matchMaker.findMatch();
            if (match) {
                const { user1, user2, roomId } = match;

                const socket1 = io.sockets.sockets.get(user1);
                const socket2 = io.sockets.sockets.get(user2);

                if (socket1 && socket2) {
                    socket1.join(roomId);
                    socket2.join(roomId);

                    let dbMatchId = null;
                    try {
                        if (process.env.DATABASE_URL) {
                            const res = await db.query(
                                'INSERT INTO matches (user_a_id, user_b_id) VALUES ($1, $2) RETURNING id',
                                [user1, user2]
                            );
                            dbMatchId = res.rows[0].id;
                        }
                    } catch (err) {
                        console.error('Failed to log match start', err);
                    }

                    activeRooms.set(roomId, { id: dbMatchId, users: [user1, user2] });

                    io.to(roomId).emit(EVENTS.MATCH_FOUND, { roomId });
                    console.log(`Match started: ${user1} <-> ${user2}`);
                } else {
                    if (socket1) matchMaker.addUser(user1);
                    if (socket2) matchMaker.addUser(user2);
                }
            }
        });

        socket.on(EVENTS.SEND_MESSAGE, (data) => {
            const { content, roomId } = data;

            const now = Date.now();
            const userLimit = rateLimits.get(socket.id) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

            if (now > userLimit.resetTime) {
                userLimit.count = 0;
                userLimit.resetTime = now + RATE_LIMIT_WINDOW;
            }

            if (userLimit.count >= MAX_MSGS_PER_WINDOW) {
                socket.emit(EVENTS.ERROR, { message: 'Rate limit exceeded' });
                return;
            }
            userLimit.count++;
            rateLimits.set(socket.id, userLimit);

            if (!content || content.length > 500) {
                socket.emit(EVENTS.ERROR, { message: 'Message too long or empty' });
                return;
            }

            socket.to(roomId).emit(EVENTS.RECEIVE_MESSAGE, {
                sender: 'partner',
                content,
                timestamp: new Date().toISOString()
            });
        });

        socket.on(EVENTS.SKIP_CHAT, async ({ roomId }) => {
            await handleRoomEnd(roomId, 'skipped');
        });

        socket.on(EVENTS.DISCONNECT, async () => {
            console.log(`Socket disconnected: ${socket.id}`);

            matchMaker.removeUser(socket.id);
            rateLimits.delete(socket.id);
            for (const [rId, meta] of activeRooms.entries()) {
                if (meta.users.includes(socket.id)) {
                    await handleRoomEnd(rId, 'disconnect');
                    break;
                }
            }
        });
        const handleRoomEnd = async (roomId, reason) => {
            const meta = activeRooms.get(roomId);
            if (!meta) return;

            io.to(roomId).emit(EVENTS.PARTNER_DISCONNECTED, { reason }); // notify both/partner
            io.in(roomId).socketsLeave(roomId);

            if (meta.id && process.env.DATABASE_URL) {
                try {
                    await db.query('UPDATE matches SET ended_at = NOW(), status = $1 WHERE id = $2', ['ended', meta.id]);
                } catch (err) {
                    console.error('Failed to log match end', err);
                }
            }
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} ended. Reason: ${reason}`);
        };
    });
};
