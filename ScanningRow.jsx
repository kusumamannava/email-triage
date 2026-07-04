export default function ScanningRow({ email }) {
  return (
    <div className="email-scanning flex items-center gap-3 px-4 py-2 border-b border-[#f1f3f4]">
      <div className="w-4 h-4 flex-shrink-0"/>
      <div className="w-4 h-4 flex-shrink-0"/>
      {/* Spinning dot */}
      <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] flex-shrink-0 animate-pulse"/>
      {/* Shimmer avatar */}
      <div className="w-8 h-8 rounded-full shimmer-bar flex-shrink-0"/>
      {/* Shimmer sender */}
      <div className="w-28 h-3 rounded shimmer-bar flex-shrink-0"/>
      {/* Shimmer subject */}
      <div className="flex-1 flex items-center gap-2">
        <div className="w-48 h-3 rounded shimmer-bar"/>
        <span className="text-[#5f6368] text-xs animate-pulse">Analyzing urgency...</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <div className="w-16 h-3 rounded shimmer-bar"/>
      </div>
    </div>
  )
}
