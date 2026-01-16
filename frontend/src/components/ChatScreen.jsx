import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export default function ChatScreen({ messages, onSendMessage, onSkip, partnerGone }) {
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, partnerGone]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !partnerGone) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 min-h-0">
                <div className="text-center text-xs text-gray-600 font-mono mb-4">CONNECTION ESTABLISHED</div>

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex w-full font-mono text-sm",
                            msg.isSelf ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[75%] px-4 py-2 break-words",
                                msg.isSelf
                                    ? "bg-[#222] text-white border border-[#333]"
                                    : "text-gray-300 border border-[#222]"
                            )}
                        >
                            <span className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">{msg.isSelf ? 'You' : 'Stranger'}</span>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {partnerGone && (
                    <div className="flex justify-center my-6">
                        <div className="text-red-500 font-mono text-xs border border-red-900/30 bg-red-900/10 px-3 py-1 uppercase">
                            Connection Lost
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#111] border-t border-[#222]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onSkip}
                        className="px-4 py-3 bg-[#1a1a1a] hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/30 border border-[#333] text-gray-400 text-xs font-bold uppercase transition-colors"
                    >
                        {partnerGone ? 'New' : 'Skip'}
                    </button>

                    <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={partnerGone}
                            autoFocus
                            placeholder={partnerGone ? "DISCONNECTED" : "Enter message..."}
                            className="w-full bg-[#0a0a0a] border border-[#333] focus:border-white transition-colors px-4 py-3 text-white placeholder-gray-700 outline-none text-sm font-mono"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || partnerGone}
                            className="bg-white text-black px-6 text-xs font-bold uppercase hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
}
