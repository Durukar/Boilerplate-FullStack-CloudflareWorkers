export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden selection:bg-purple-900 selection:text-white">
      <div className="energy-beam"></div>
      <div className="absolute w-[800px] h-[500px] bg-purple-900/10 rounded-[100%] blur-[120px] pointer-events-none opacity-40"></div>
      <div className="relative z-10 text-center space-y-4 bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-white/5">
        
        <p className="font-mono text-sm md:text-base text-purple-500 font-medium tracking-[0.5em] uppercase pl-2 animate-pulse">
          Boilerplate
        </p>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white">
          Cloudflare Workers
        </h1>
        
      </div>
      
    </div>
  )
}