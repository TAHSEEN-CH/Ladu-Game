function Token({
    id,
    color = 'red',
    playerId,
    position,
    isSelected = false,
    isMovable = false,
    isWinner = false,
    disabled = false,
    onClick
}) {
    const getColorStyles = () => {
        const colors = {
            red: 'bg-red-500 border-red-600 shadow-red-500/30',
            green: 'bg-green-500 border-green-600 shadow-green-500/30',
            yellow: 'bg-yellow-400 border-yellow-500 shadow-yellow-400/30',
            blue: 'bg-blue-500 border-blue-600 shadow-blue-500/30'
        };
        return colors[color] || colors.red;
    };

    const getStateStyles = () => {
        if (disabled) {
            return 'opacity-40 cursor-not-allowed grayscale';
        }
        if (isWinner) {
            return 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-800 animate-pulse scale-110';
        }
        if (isSelected) {
            return 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-800 scale-110';
        }
        if (isMovable) {
            return 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-800 scale-105 cursor-pointer hover:scale-110';
        }
        return 'cursor-pointer hover:scale-105';
    };

    const getShadowStyles = () => {
        if (isSelected || isWinner || isMovable) {
            return 'shadow-lg';
        }
        return 'shadow-md';
    };

    return (
        <div
            id={id}
            className={`
        relative aspect-square w-full h-full rounded-full 
        ${getColorStyles()} ${getShadowStyles()}
        border-2 transition-all duration-300 ease-in-out
        ${getStateStyles()}
        flex items-center justify-center
        ${!disabled && onClick ? 'active:scale-95' : ''}
      `}
            onClick={!disabled ? onClick : undefined}
            role="button"
            tabIndex={!disabled ? 0 : -1}
            aria-label={`Token ${color} - Player ${playerId}`}
            aria-disabled={disabled}
            aria-selected={isSelected}
            data-color={color}
            data-player={playerId}
            data-position={position}
            data-selected={isSelected}
            data-movable={isMovable}
            data-winner={isWinner}
        >
            <div className="absolute inset-1 rounded-full bg-white/20 opacity-50" />
            <div className="absolute inset-2 rounded-full bg-black/20 opacity-20" />
            {isWinner && (
                <span className="absolute -top-1 -right-1 text-yellow-400 text-xs sm:text-sm">
                    ★
                </span>
            )}
            {isMovable && !isSelected && (
                <div className="absolute -inset-1 rounded-full border-2 border-green-400/50 animate-pulse" />
            )}
        </div>
    );
}

export default Token;