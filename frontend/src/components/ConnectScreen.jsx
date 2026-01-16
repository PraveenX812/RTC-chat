export default function ConnectScreen({ onSearch }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a]">
            <h2 className="text-3xl font-bold mb-4 text-white tracking-widest text-shadow">
                ESTABLISH CONNECTION
            </h2>
            <p className="text-gray-500 max-w-sm mb-12 text-sm">
                Initiate real-time text chat with anonymous users.
            </p>

            <button
                onClick={onSearch}
                className="px-10 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
                Start
            </button>
        </div>
    );
}
