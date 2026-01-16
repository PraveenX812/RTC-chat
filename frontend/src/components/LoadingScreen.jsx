export default function LoadingScreen() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a]">
            <div className="w-16 h-1 bg-[#222] overflow-hidden mb-6">
                <div className="h-full bg-white animate-[loading_1s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
            </div>
            <h2 className="text-xl font-bold font-mono animate-pulse">CONNECTING...</h2>
        </div>
    );
}
