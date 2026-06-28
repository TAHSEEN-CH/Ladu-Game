import React, { useMemo } from 'react';
import BoardCell from './BoardCell';
import Token from '../Token/Token';
import { generateBoard } from '../../utils/boardGenerator';
import { TOKEN } from '../../constants/gameConstants';

function LudoBoard({
    board = null,
    tokens = [],
    selectedToken = null,
    highlightedCells = [],
    onCellClick = () => { },
    onTokenClick = () => { }
}) {
    const boardData = useMemo(() => {
        return board || generateBoard();
    }, [board]);

    const tokenMap = useMemo(() => {
        const map = new Map();
        tokens.forEach(token => {
            if (!map.has(token.position)) {
                map.set(token.position, []);
            }
            map.get(token.position).push(token);
        });
        return map;
    }, [tokens]);

    const getTokensAtPosition = (position) => {
        return tokenMap.get(position) || [];
    };

    const isCellHighlighted = (cellId) => {
        return highlightedCells.includes(cellId);
    };

    const isTokenSelected = (tokenId) => {
        return selectedToken === tokenId;
    };

    const handleCellClick = (cellId) => {
        if (onCellClick) {
            onCellClick(cellId);
        }
    };

    const handleTokenClick = (tokenId, event) => {
        event.stopPropagation();
        if (onTokenClick) {
            onTokenClick(tokenId);
        }
    };

    return (
        <div className="w-full h-full aspect-square bg-gray-800 rounded-xl border-2 border-gray-600 p-2 sm:p-3 md:p-4">
            <div
                className="w-full h-full grid gap-0.5 bg-gray-700 rounded-lg"
                style={{
                    gridTemplateColumns: `repeat(${boardData.size}, 1fr)`,
                    gridTemplateRows: `repeat(${boardData.size}, 1fr)`
                }}
                role="grid"
                aria-label="Ludo Board"
            >
                {boardData.cells.map((cell) => {
                    const cellTokens = getTokensAtPosition(cell.id);
                    const isHighlighted = isCellHighlighted(cell.id);
                    const cellId = cell.id;

                    return (
                        <BoardCell
                            key={cellId}
                            id={cellId}
                            type={cell.type}
                            color={cell.color}
                            isSafe={cell.isSafe}
                            isHome={cell.isHome}
                            isCenter={cell.isCenter}
                            isHighlighted={isHighlighted}
                            tokens={cellTokens}
                            onClick={() => handleCellClick(cellId)}
                        >
                            {cellTokens.length > 0 && cellTokens.map((token) => (
                                <Token
                                    key={token.id}
                                    id={token.id}
                                    color={token.color}
                                    playerId={token.playerId}
                                    position={token.position}
                                    isSelected={isTokenSelected(token.id)}
                                    isMovable={isHighlighted}
                                    isWinner={token.isWinner || false}
                                    disabled={!isHighlighted}
                                    onClick={(e) => handleTokenClick(token.id, e)}
                                />
                            ))}
                        </BoardCell>
                    );
                })}
            </div>
        </div>
    );
}

export default React.memo(LudoBoard);