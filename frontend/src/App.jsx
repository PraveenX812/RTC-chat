import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ConnectScreen from './components/ConnectScreen';
import ChatScreen from './components/ChatScreen';
import LoadingScreen from './components/LoadingScreen';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function App() {
  const [status, setStatus] = useState('IDLE'); // states- IDLE, SEARCHING, CONNECTED
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [partnerGone, setPartnerGone] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server', socket.id);
    });

    socket.on('match_found', (data) => {
      setStatus('CONNECTED');
      setRoomId(data.roomId);
      setMessages([]);
      setPartnerGone(false);
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, { ...data, isSelf: false }]);
    });

    socket.on('partner_disconnected', () => {
      setPartnerGone(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = () => {
    setStatus('SEARCHING');
    setPartnerGone(false);
    socketRef.current.emit('search_partner');
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const msg = { content: text, roomId, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, { ...msg, isSelf: true }]);
    socketRef.current.emit('send_message', msg);
  };

  const handleSkip = () => {
    if (status === 'CONNECTED' || partnerGone) {
      socketRef.current.emit('skip_chat', { roomId });
    }
    handleSearch();
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl h-[600px] flex flex-col bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden font-mono">
        <div className="h-14 border-b border-[#222] flex items-center justify-between px-6 bg-[#161616]">
          <h1 className="text-lg font-semibold tracking-wider text-gray-200">
            ANON_CHAT v1.0
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>STATUS: {status === 'CONNECTED' ? 'SECURE_LINK' : 'IDLE'}</span>
            <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        <div className="flex-1 bg-[#0a0a0a] relative flex flex-col min-h-0 overflow-hidden">
          {status === 'IDLE' && <ConnectScreen onSearch={handleSearch} />}
          {status === 'SEARCHING' && <LoadingScreen />}
          {status === 'CONNECTED' && (
            <ChatScreen
              messages={messages}
              onSendMessage={handleSendMessage}
              onSkip={handleSkip}
              partnerGone={partnerGone}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
