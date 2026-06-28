function BoardCell({
  id,
  type = 'path',
  color = 'gray',
  isSafe = false,
  isHome = false,
  isCenter = false,
  isHighlighted = false,
  tokens = [],
  onClick
}) {
  const getCellStyles = () => {
    let baseStyles = 'relative aspect-square rounded-sm transition-all duration-200 w-full h-full';

    if (type === 'home') {
      return `${baseStyles} bg-${color}-900/40 border-2 border-${color}-600/30`;
    }

    if (type === 'center') {
      return `${baseStyles} bg-yellow-400/10 border-2 border-yellow-400/30`;
    }

    if (type === 'path') {
      if (isSafe) {
        return `${baseStyles} bg-green-500/20 border border-green-500/30`;
      }
      return `${baseStyles} bg-gray-600/20 border border-gray-500/20 hover:bg-gray-600/30`;
    }

    return baseStyles;
  };

  const getHighlightStyles = () => {
    if (isHighlighted && onClick) {
      return 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800 scale-105';
    }
    return '';
  };

  const getClickableStyles = () => {
    if (onClick) {
      return 'cursor-pointer hover:scale-105 active:scale-95';
    }
    return 'cursor-default';
  };

  const renderTokens = () => {
    if (tokens.length === 0) return null;

    const tokenColors = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-400',
      blue: 'bg-blue-500'
    };

    return (
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 p-0.5">
        {tokens.slice(0, 4).map((token, index) => (
          <div
            key={`${id}-token-${index}`}
            className={`w-1/3 h-1/3 rounded-full ${tokenColors[token.color] || 'bg-gray-500'} 
              shadow-lg border-2 border-white/30 transition-all duration-300 hover:scale-110`}
            style={{
              transform: tokens.length > 2 ? `translate(${(index - (tokens.length - 1) / 2) * 4}px, 0)` : 'none'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      id={id}
      className={`${getCellStyles()} ${getHighlightStyles()} ${getClickableStyles()}`}
      onClick={onClick}
      role="gridcell"
      aria-label={`Cell ${id} - ${type}`}
      data-type={type}
      data-safe={isSafe}
      data-home={isHome}
      data-center={isCenter}
    >
      {renderTokens()}
      {isSafe && (
        <div className="absolute top-0.5 right-0.5">
          <span className="text-[6px] sm:text-[8px] text-green-400">★</span>
        </div>
      )}
    </div>
  );
}

export default BoardCell;