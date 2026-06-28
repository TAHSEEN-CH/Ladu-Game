function Board() {
  return (
    <div className="w-full h-full aspect-square bg-gray-800 rounded-xl border-2 border-gray-600 p-2 sm:p-3 md:p-4">
      <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0.5 bg-gray-700 rounded-lg">
        {/* Red Home - Top Left */}
        <div className="col-span-6 row-span-6 bg-red-900/40 border border-red-600/30 rounded-lg flex items-center justify-center">
          <span className="text-red-400 font-bold text-xs sm:text-sm md:text-base">Red Home</span>
        </div>

        {/* Green Home - Top Right */}
        <div className="col-span-6 row-span-6 col-start-10 bg-green-900/40 border border-green-600/30 rounded-lg flex items-center justify-center">
          <span className="text-green-400 font-bold text-xs sm:text-sm md:text-base">Green Home</span>
        </div>

        {/* Yellow Home - Bottom Left */}
        <div className="col-span-6 row-span-6 row-start-10 bg-yellow-900/40 border border-yellow-600/30 rounded-lg flex items-center justify-center">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm md:text-base">Yellow Home</span>
        </div>

        {/* Blue Home - Bottom Right */}
        <div className="col-span-6 row-span-6 col-start-10 row-start-10 bg-blue-900/40 border border-blue-600/30 rounded-lg flex items-center justify-center">
          <span className="text-blue-400 font-bold text-xs sm:text-sm md:text-base">Blue Home</span>
        </div>

        {/* Top Path Row */}
        <div className="col-span-3 row-span-6 col-start-7 bg-gray-600/30 border border-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-[8px] sm:text-xs">Path</span>
        </div>

        {/* Bottom Path Row */}
        <div className="col-span-3 row-span-6 col-start-7 row-start-10 bg-gray-600/30 border border-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-[8px] sm:text-xs">Path</span>
        </div>

        {/* Left Path Column */}
        <div className="col-span-6 row-span-3 row-start-7 bg-gray-600/30 border border-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-[8px] sm:text-xs">Path</span>
        </div>

        {/* Right Path Column */}
        <div className="col-span-6 col-start-10 row-span-3 row-start-7 bg-gray-600/30 border border-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-[8px] sm:text-xs">Path</span>
        </div>

        {/* Center Winning Area */}
        <div className="col-span-3 row-span-3 col-start-7 row-start-7 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-lg flex flex-col items-center justify-center">
          <span className="text-yellow-400 font-bold text-[8px] sm:text-xs md:text-sm">★</span>
          <span className="text-yellow-400 font-bold text-[8px] sm:text-xs md:text-sm">WIN</span>
        </div>
      </div>
    </div>
  );
}

export default Board;