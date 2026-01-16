module.exports = {
    EVENTS: {
        CONNECT: 'connection',
        DISCONNECT: 'disconnect',
        SEARCH_PARTNER: 'search_partner',
        MATCH_FOUND: 'match_found',
        SEND_MESSAGE: 'send_message',
        RECEIVE_MESSAGE: 'receive_message',
        SKIP_CHAT: 'skip_chat',
        PARTNER_DISCONNECTED: 'partner_disconnected',
        TYPING: 'typing',
        STOP_TYPING: 'stop_typing',
        ERROR: 'error'
    },
    MATCH_STATUS: {
        WAITING: 'waiting',
        ACTIVE: 'active',
        ENDED: 'ended'
    }
};
