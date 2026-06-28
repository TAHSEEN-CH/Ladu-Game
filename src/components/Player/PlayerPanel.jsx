function PlayerPanel({
  player = {
    id: '',
    name: 'Player',
    color: 'red',
    avatar: null,
    connected: true,
    score: 0,
    tokens: 4
  },
  isCurrentTurn = false,
  isConnected = true,
  isWinner = false,
  rank = null,
  diceValue = null,
  remainingTokens = 4,
  onPlayerClick
}) {
  const getColorStyles = () => {
    const colors = {
      red: 'border-red-500 bg-red-500/10',
      green: 'border-green-500 bg-green-500/10',
      yellow: 'border-yellow-400 bg-yellow-400/10',
      blue: 'border-blue-500 bg-blue-500/10'
    };
    return colors[player.color] || colors.red;
  };

  const getTextColor = () => {
    const colors = {
      red: 'text-red-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      blue: 'text-blue-400'
    };
    return colors[player.color] || colors.red;
  };

  const getAvatarColor = () => {
    const colors = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-400',
      blue: 'bg-blue-500'
    };
    return colors[player.color] || colors.red;
  };

  const getStatusIndicator = () => {
    if (!isConnected) {
      return <span className="text-xs text-red-400">● Disconnected</span>;
    }
    if (isWinner) {
      return <span className="text-xs text-yellow-400">★ Winner!</span>;
    }
    if (isCurrentTurn) {
      return <span className="text-xs text-green-400 animate-pulse">● Your Turn</span>;
    }
    return <span className="text-xs text-green-400">● Online</span>;
  };

  const getDiceDisplay = () => {
    if (diceValue !== null && diceValue !== undefined) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Dice:</span>
          <span className="text-sm font-bold text-white bg-gray-700 px-2 py-0.5 rounded">
            {diceValue}
          </span>
        </div>
      );
    }
    return null;
  };

  const getRankBadge = () => {
    if (rank === null || rank === undefined) return null;
    const medals = ['🥇', '🥈', '🥉'];
    const colors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
    const rankIndex = rank - 1;
    if (rankIndex < 3) {
      return (
        <div className={`text-lg ${colors[rankIndex]} font-bold`}>
          {medals[rankIndex]}
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-400 font-bold">
        #{rank}
      </div>
    );
  };

  return (
    <div
      className={`
        relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300
        ${getColorStyles()}
        ${isCurrentTurn ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900 scale-105 shadow-lg shadow-yellow-400/20' : ''}
        ${isWinner ? 'border-yellow-400 bg-yellow-400/10' : ''}
        ${!isConnected ? 'opacity-60 grayscale' : ''}
        ${onPlayerClick ? 'cursor-pointer hover:scale-102 active:scale-98' : ''}
      `}
      onClick={onPlayerClick}
      role="button"
      tabIndex={onPlayerClick ? 0 : -1}
      aria-label={`Player ${player.name}`}
      data-color={player.color}
      data-connected={isConnected}
      data-turn={isCurrentTurn}
      data-winner={isWinner}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full 
          ${getAvatarColor()} 
          flex items-center justify-center
          text-white font-bold text-sm sm:text-base
          shadow-lg shrink-0
          ${isCurrentTurn ? 'ring-2 ring-yellow-400' : ''}
          ${isWinner ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
        `}>
          {player.avatar || player.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`
                text-sm sm:text-base font-semibold truncate
                ${getTextColor()}
                ${isWinner ? 'text-yellow-400' : ''}
              `}>
                {player.name}
                {isWinner && ' 🏆'}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusIndicator()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getRankBadge()}
              {isCurrentTurn && (
                <span className="text-[10px] sm:text-xs text-yellow-400 font-medium bg-yellow-400/20 px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs text-gray-400">Tokens:</span>
              <span className="text-xs sm:text-sm font-medium text-white">
                {remainingTokens}
              </span>
            </div>
            {getDiceDisplay()}
            {player.score > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs text-gray-400">Score:</span>
                <span className="text-xs sm:text-sm font-medium text-yellow-400">
                  {player.score}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCurrentTurn && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
      )}
      {isWinner && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
      )}
    </div>
  );
}

export default PlayerPanel;