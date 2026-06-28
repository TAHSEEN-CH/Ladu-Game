import Board from '../Board/Board';
import Dice from '../Dice/Dice';
import PlayerPanel from '../Player/PlayerPanel';

function GameContainer({
    players = [],
    currentPlayer = null,
    diceValue = 1,
    isRolling = false,
    boardData = null,
    gameStatus = 'waiting',
    onRollDice = () => { },
    onTokenClick = () => { }
}) {
    const getCurrentPlayer = () => {
        if (!currentPlayer) return null;
        return players.find(p => p.id === currentPlayer) || null;
    };

    const currentPlayerData = getCurrentPlayer();
    const canRoll = gameStatus === 'playing' && currentPlayerData?.id === players[0]?.id;

    const getStatusMessage = () => {
        if (gameStatus === 'waiting') return 'Waiting for players to join...';
        if (gameStatus === 'ready') return 'All players ready! Starting soon...';
        if (gameStatus === 'playing') return `Game in progress - ${currentPlayerData?.name || 'Player'}'s turn`;
        if (gameStatus === 'finished') return 'Game Over!';
        return 'Loading...';
    };

    const renderPlayerPanels = () => {
        if (players.length === 0) {
            return (
                <div className="col-span-12 text-center py-8 text-gray-400">
                    Waiting for players to join...
                </div>
            );
        }

        const panelPositions = {
            red: 'order-1',
            green: 'order-2',
            yellow: 'order-3',
            blue: 'order-4'
        };

        return players.map((player) => (
            <div key={player.id} className={`${panelPositions[player.color] || ''} w-full`}>
                <PlayerPanel
                    player={player}
                    isCurrentTurn={player.id === currentPlayer}
                    isConnected={player.connected !== false}
                    isWinner={player.isWinner || false}
                    rank={player.rank || null}
                    diceValue={player.lastDiceValue || null}
                    remainingTokens={player.tokens || 0}
                />
            </div>
        ));
    };

    const renderDesktopLayout = () => {
        const playerPanels = renderPlayerPanels();

        return (
            <>
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                    <div className="space-y-4">
                        {players.slice(0, 2).map((player) => (
                            <PlayerPanel
                                key={player.id}
                                player={player}
                                isCurrentTurn={player.id === currentPlayer}
                                isConnected={player.connected !== false}
                                isWinner={player.isWinner || false}
                                rank={player.rank || null}
                                diceValue={player.lastDiceValue || null}
                                remainingTokens={player.tokens || 0}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-lg">
                            <Board />
                        </div>
                        <Dice
                            value={diceValue}
                            isRolling={isRolling}
                            disabled={!canRoll}
                            canRoll={canRoll}
                            currentPlayer={currentPlayerData?.color || null}
                            onRoll={onRollDice}
                        />
                        <div className="text-sm text-gray-400 text-center mt-2">
                            {getStatusMessage()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {players.slice(2, 4).map((player) => (
                            <PlayerPanel
                                key={player.id}
                                player={player}
                                isCurrentTurn={player.id === currentPlayer}
                                isConnected={player.connected !== false}
                                isWinner={player.isWinner || false}
                                rank={player.rank || null}
                                diceValue={player.lastDiceValue || null}
                                remainingTokens={player.tokens || 0}
                            />
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const renderMobileTabletLayout = () => {
        return (
            <div className="lg:hidden flex flex-col items-center gap-4">
                <div className="w-full max-w-sm">
                    <Board />
                </div>
                <div className="w-full max-w-sm">
                    <Dice
                        value={diceValue}
                        isRolling={isRolling}
                        disabled={!canRoll}
                        canRoll={canRoll}
                        currentPlayer={currentPlayerData?.color || null}
                        onRoll={onRollDice}
                    />
                </div>
                <div className="text-sm text-gray-400 text-center mt-2">
                    {getStatusMessage()}
                </div>
                <div className="w-full max-w-sm overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-3 min-w-max">
                        {players.map((player) => (
                            <div key={player.id} className="w-56 shrink-0">
                                <PlayerPanel
                                    player={player}
                                    isCurrentTurn={player.id === currentPlayer}
                                    isConnected={player.connected !== false}
                                    isWinner={player.isWinner || false}
                                    rank={player.rank || null}
                                    diceValue={player.lastDiceValue || null}
                                    remainingTokens={player.tokens || 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Ludo Game</h2>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm px-3 py-1 rounded-full ${gameStatus === 'playing' ? 'bg-green-500/20 text-green-400' :
                                gameStatus === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                                    gameStatus === 'finished' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-gray-500/20 text-gray-400'
                            }`}>
                            {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
                        </span>
                    </div>
                </div>

                {renderDesktopLayout()}
                {renderMobileTabletLayout()}
            </div>
        </div>
    );
}

export default GameContainer;