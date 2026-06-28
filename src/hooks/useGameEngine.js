import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { actionTypes } from '../context/GameReducer';

function useGameEngine() {
  const { state, dispatch } = useGame();

  const rollDice = useCallback(() => {
    dispatch({
      type: actionTypes.ROLL_DICE,
      payload: { value: 1, isRolling: true }
    });
  }, [dispatch]);

  const moveToken = useCallback((tokenId, newPosition) => {
    dispatch({
      type: actionTypes.MOVE_TOKEN,
      payload: { tokenId, newPosition }
    });
  }, [dispatch]);

  const endTurn = useCallback(() => {
    const nextPlayerId = state.players.find(
      player => player.id !== state.currentTurn.playerId
    )?.id || null;

    dispatch({
      type: actionTypes.SET_CURRENT_TURN,
      payload: {
        playerId: nextPlayerId,
        playerName: state.players.find(p => p.id === nextPlayerId)?.name || null,
        playerColor: state.players.find(p => p.id === nextPlayerId)?.color || null,
        turnNumber: state.currentTurn.turnNumber + 1,
        timeRemaining: state.settings.turnTimeLimit || 30
      }
    });
  }, [dispatch, state.currentTurn, state.players, state.settings]);

  const startGame = useCallback(() => {
    dispatch({
      type: actionTypes.SET_GAME_STATUS,
      payload: 'playing'
    });

    const firstPlayer = state.players[0];
    if (firstPlayer) {
      dispatch({
        type: actionTypes.SET_CURRENT_TURN,
        payload: {
          playerId: firstPlayer.id,
          playerName: firstPlayer.name,
          playerColor: firstPlayer.color,
          turnNumber: 1,
          timeRemaining: state.settings.turnTimeLimit || 30
        }
      });
    }
  }, [dispatch, state.players, state.settings]);

  const resetGame = useCallback(() => {
    dispatch({
      type: actionTypes.RESET_GAME
    });
  }, [dispatch]);

  const leaveGame = useCallback(() => {
    dispatch({
      type: actionTypes.SET_GAME_STATUS,
      payload: 'waiting'
    });
    dispatch({
      type: actionTypes.SET_CURRENT_TURN,
      payload: {
        playerId: null,
        playerName: null,
        playerColor: null,
        turnNumber: 0,
        timeRemaining: 30
      }
    });
  }, [dispatch]);

  const joinRoom = useCallback((roomId, playerData) => {
    dispatch({
      type: actionTypes.SET_ROOM,
      payload: {
        id: roomId,
        ...playerData
      }
    });
  }, [dispatch]);

  const createRoom = useCallback((roomData) => {
    dispatch({
      type: actionTypes.SET_ROOM,
      payload: {
        ...roomData,
        createdAt: new Date().toISOString()
      }
    });
  }, [dispatch]);

  const engineAPI = useMemo(() => ({
    rollDice,
    moveToken,
    endTurn,
    startGame,
    resetGame,
    leaveGame,
    joinRoom,
    createRoom,
    players: state.players,
    board: state.board,
    dice: state.dice,
    currentTurn: state.currentTurn,
    gameStatus: state.gameStatus,
    winner: state.winner,
    room: state.room,
    settings: state.settings
  }), [
    rollDice,
    moveToken,
    endTurn,
    startGame,
    resetGame,
    leaveGame,
    joinRoom,
    createRoom,
    state.players,
    state.board,
    state.dice,
    state.currentTurn,
    state.gameStatus,
    state.winner,
    state.room,
    state.settings
  ]);

  return engineAPI;
}

export default useGameEngine;