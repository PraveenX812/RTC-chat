class MatchMaker {
    constructor() {
        this.waitingQueue = [];
        this.activeMatches = new Map();
    }

    addUser(socketId) {
        if (this.waitingQueue.includes(socketId)) {
            console.warn(`User ${socketId} already in queue`);
            return;
        }
        this.waitingQueue.push(socketId);
        console.log(`User ${socketId} added to queue. Queue size: ${this.waitingQueue.length}`);
    }

    removeUser(socketId) {
        const index = this.waitingQueue.indexOf(socketId);
        if (index !== -1) {
            this.waitingQueue.splice(index, 1);
            console.log(`User ${socketId} removed from queue.`);
            return true;
        }
        return false;
    }

    findMatch() {
        if (this.waitingQueue.length >= 2) {
            const user1 = this.waitingQueue.shift();
            const user2 = this.waitingQueue.shift();

            const roomId = `room_${user1}_${user2}_${Date.now()}`;

            console.log(`Match found: ${user1} and ${user2} in ${roomId}`);
            return {
                user1,
                user2,
                roomId
            };
        }
        return null;
    }

    getQueueLength() {
        return this.waitingQueue.length;
    }
}

module.exports = new MatchMaker();
