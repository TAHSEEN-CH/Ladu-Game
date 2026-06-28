import PlayerPanel from './PlayerPanel';

function PlayersList({
    players = [],
    currentPlayerId = null,
    onPlayerSelect
}) {
    if (players.length === 0) {
        return (
            <div className="w-full p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-400 text-sm">No players yet</p>
                <p className="text-gray-500 text-xs mt-1">Waiting for players to join...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="hidden sm:flex sm:flex-col gap-3">
                {players.map((player) => (
                    <PlayerPanel
                        key={player.id}
                        player={player}
                        isCurrentTurn={player.id === currentPlayerId}
                        isConnected={player.connected !== false}
                        isWinner={player.isWinner || false}
                        rank={player.rank || null}
                        diceValue={player.lastDiceValue || null}
                        remainingTokens={player.tokens || 0}
                        onPlayerClick={onPlayerSelect ? () => onPlayerSelect(player.id) : undefined}
                    />
                ))}
            </div>

            <div className="sm:hidden overflow-x-auto pb-4 -mx-2 px-2">
                <div className="flex gap-3 min-w-max">
                    {players.map((player) => (
                        <div key={player.id} className="w-56 shrink-0">
                            <PlayerPanel
                                player={player}
                                isCurrentTurn={player.id === currentPlayerId}
                                isConnected={player.connected !== false}
                                isWinner={player.isWinner || false}
                                rank={player.rank || null}
                                diceValue={player.lastDiceValue || null}
                                remainingTokens={player.tokens || 0}
                                onPlayerClick={onPlayerSelect ? () => onPlayerSelect(player.id) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center sm:text-left">
                {players.length} player{players.length > 1 ? 's' : ''} in game
            </div>
        </div>
    );
}

export default PlayersList;