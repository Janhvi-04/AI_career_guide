export default function CircularMatch({ value }) {
  return (
    <div
      className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full p-1 sm:h-40 sm:w-40"
      style={{
        background: `conic-gradient(rgb(79 70 229) ${value * 3.6}deg, rgb(226 232 240) 0deg)`,
      }}
    >
      <div className="flex h-[calc(100%-8px)] w-[calc(100%-8px)] flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <span className="text-2xl font-bold text-slate-800">{value}%</span>
        <span className="text-center text-[10px] font-medium text-slate-500">Match Score</span>
      </div>
    </div>
  )
}
