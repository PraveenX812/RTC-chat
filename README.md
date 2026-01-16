# Anonymous Random Text Chat System

A
full-stack application
that allows
anonymous users
to be randomly paired for
one-to-one real-time text chat
, with basic reliability and scalability considerations.
## Architecture Overview
The system uses a Real-Time Event Driven architecture.
- **Frontend**: React acts as the client. It maintains a persistent WebSocket connection to the server.
- **Backend**: Node.js with Socket.IO handles the signaling. It manages a queue of waiting users and pairs them up.
- **Database**: PostgreSQL is used asynchronously to log match details (start time, end time) for analytics.
- **Communication**: Messages are exchanged directly between users via the server using WebSockets, ensuring low latency.

## Matchmaking & Chat Flow
1. **Connect**: User opens the site and connects to the server (Socket.IO).
2. **Search**: User clicks 'Start'. The backend receives a `search_partner` event.
3. **Queue**: The server adds the user's socket ID to a waiting queue.
4. **Match**: 
   - The server checks if there are at least 2 people in the queue.
   - If yes, it removes the first 2 users.
   - It creates a unique Room ID.
   - It joins both users to this Room.
   - It sends a `match_found` event to both users.
5. **Chat**: When User A sends a message:
   - It goes to the server.
   - The server relays it ONLY to the specific Room ID.
   - User B receives it instantly.
6. **Disconnect/Skip**: If a user clicks Skip, the server notifies the partner and the user is re-added to the queue.

## Deployment Approach
We use a decoupled deployment strategy:
- **Backend**: Deployed on **Render**.
   - Render automatically provisions a PostgreSQL database via the `render.yaml` blueprint.
   - It injects the database connection string directly into the app.
- **Frontend**: Deployed on **Vercel**.
   - It is configured with an environment variable `VITE_BACKEND_URL` to know where to connect.

## Known Limitations
1. **Scalability**: The matchmaking queue is currently stored in the server's memory. If we deploy multiple server instances, users on Server A cannot match with users on Server B.
2. **Reconnection**: If a user's internet drops for a second, the socket might disconnect and the chat session is lost. There is no reconnection logic to restore the exact same session.
3. **Moderation**: There is no text filter for bad words and cannot report, block users. 
