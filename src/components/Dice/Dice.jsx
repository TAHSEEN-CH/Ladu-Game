function Dice({
  value = 1,
  isRolling = false,
  disabled = false,
  canRoll = false,
  currentPlayer = null,
  onRoll
}) {
  const getDots = () => {
    const dotPositions = {
      1: ['center'],
      2: ['top-right', 'bottom-left'],
      3: ['top-right', 'center', 'bottom-left'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    const positions = {
      'top-left': 'top-1 left-1',
      'top-right': 'top-1 right-1',
      'middle-left': 'top-1/2 left-1 -translate-y-1/2',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'middle-right': 'top-1/2 right-1 -translate-y-1/2',
      'bottom-left': 'bottom-1 left-1',
      'bottom-right': 'bottom-1 right-1'
    };

    return (dotPositions[value] || dotPositions[1]).map((position) => (
      <div
        key={position}
        className={`absolute w-2 h-2 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-inner ${positions[position]}`}
      />
    ));
  };

  const getPlayerColor = () => {
    const colors = {
      red: 'border-red-500/50 shadow-red-500/20',
      green: 'border-green-500/50 shadow-green-500/20',
      yellow: 'border-yellow-400/50 shadow-yellow-400/20',
      blue: 'border-blue-500/50 shadow-blue-500/20'
    };
    return currentPlayer ? colors[currentPlayer] || colors.red : 'border-gray-500/50 shadow-gray-500/20';
  };

  const getStatusText = () => {
    if (disabled) return 'Waiting for your turn...';
    if (isRolling) return 'Rolling...';
    if (canRoll) return 'Click to roll!';
    return 'Cannot roll';
  };

  const getStatusColor = () => {
    if (disabled) return 'text-gray-400';
    if (isRolling) return 'text-yellow-400';
    if (canRoll) return 'text-green-400';
    return 'text-gray-500';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`
          relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
          bg-linear-to-br from-gray-700 to-gray-900 
          rounded-xl border-2 ${getPlayerColor()}
          shadow-xl transition-all duration-300
          ${!disabled && canRoll && !isRolling ? 'cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95' : ''}
          ${isRolling ? 'animate-bounce' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!disabled && canRoll && !isRolling ? onRoll : undefined}
        role="button"
        tabIndex={!disabled && canRoll && !isRolling ? 0 : -1}
        aria-label={`Dice showing ${value}`}
        aria-disabled={disabled || !canRoll || isRolling}
        data-value={value}
        data-rolling={isRolling}
      >
        <div className="absolute inset-2 rounded-lg bg-gray-800/50">
          <div className="relative w-full h-full">
            {getDots()}
          </div>
        </div>
        {isRolling && (
          <div className="absolute inset-0 rounded-xl bg-yellow-400/10 animate-pulse" />
        )}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xs sm:text-sm font-medium ${getStatusColor()} transition-colors duration-200`}>
          {getStatusText()}
        </span>
        {currentPlayer && (
          <span className="text-xs text-gray-500">
            Player: <span className={`text-${currentPlayer}-400 capitalize`}>{currentPlayer}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default Dice;