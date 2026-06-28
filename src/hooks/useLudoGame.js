import { useCallback, useMemo, useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { actionTypes } from "../context/GameReducer";
import * as ludoEngine from "../utils/ludoEngine";
import * as diceEngine from "../utils/diceEngine";
import * as tokenEngine from "../utils/tokenEngine";
import { generateBoard } from "../utils/boardGenerator";
import { generateRoomId, formatPlayerName } from "../utils/gameHelpers";
import { DEFAULT_GAME_SETTINGS, GAME_STATUS } from "../constants/gameConstants";

function useLudoGame() {
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = useCallback(
    (roomData = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const roomId = roomData.roomId || generateRoomId();
        const roomName =
          roomData.roomName || DEFAULT_GAME_SETTINGS.roomName || "Ludo Room";
        const maxPlayers =
          roomData.maxPlayers || DEFAULT_GAME_SETTINGS.maxPlayers || 4;
        const gameMode =
          roomData.gameMode || DEFAULT_GAME_SETTINGS.gameMode || "Classic";

        dispatch({
          type: actionTypes.SET_ROOM,
          payload: {
            id: roomId,
            name: roomName,
            hostId: roomData.hostId || null,
            gameMode,
            visibility: roomData.visibility || "public",
            maxPlayers,
            connectedPlayers: roomData.connectedPlayers || 0,
            createdAt: new Date().toISOString(),
          },
        });

        dispatch({
          type: actionTypes.SET_GAME_STATUS,
          payload: GAME_STATUS.WAITING,
        });

        setIsLoading(false);
        return { success: true, roomId };
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [dispatch],
  );

  const joinRoom = useCallback(
    (roomId, playerData = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!roomId) {
          throw new Error("Room ID is required");
        }

        const playerName = formatPlayerName(playerData.name || "Player");
        const playerColor = playerData.color || null;

        dispatch({
          type: actionTypes.SET_ROOM,
          payload: {
            id: roomId,
            ...roomData,
          },
        });

        const newPlayer = {
          id: playerData.id || `player-${Date.now()}`,
          name: playerName,
          color: playerColor,
          connected: true,
          isWinner: false,
          rank: null,
          score: 0,
          tokens: [],
        };

        dispatch({
          type: actionTypes.SET_PLAYERS,
          payload: [newPlayer],
        });

        dispatch({
          type: actionTypes.SET_GAME_STATUS,
          payload: GAME_STATUS.WAITING,
        });

        setIsLoading(false);
        return { success: true, player: newPlayer };
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [dispatch],
  );

  const leaveRoom = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      dispatch({
        type: actionTypes.SET_ROOM,
        payload: {
          id: null,
          name: null,
          hostId: null,
          gameMode: DEFAULT_GAME_SETTINGS.gameMode,
          visibility: "public",
          maxPlayers: DEFAULT_GAME_SETTINGS.maxPlayers,
          connectedPlayers: 0,
          createdAt: null,
        },
      });

      dispatch({
        type: actionTypes.SET_PLAYERS,
        payload: [],
      });

      dispatch({
        type: actionTypes.SET_GAME_STATUS,
        payload: GAME_STATUS.WAITING,
      });

      dispatch({
        type: actionTypes.RESET_GAME,
      });

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  const startGame = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const players = state.players;
      if (players.length < 2) {
        throw new Error("At least 2 players required to start the game");
      }

      const board = generateBoard();
      const initializedPlayers = ludoEngine.initializePlayers(players);

      dispatch({
        type: actionTypes.SET_BOARD,
        payload: {
          cells: board.cells,
          tokens: initializedPlayers.flatMap((p) => p.tokens),
          lastMove: null,
        },
      });

      dispatch({
        type: actionTypes.SET_PLAYERS,
        payload: initializedPlayers,
      });

      dispatch({
        type: actionTypes.SET_GAME_STATUS,
        payload: GAME_STATUS.PLAYING,
      });

      const firstPlayer = initializedPlayers[0];
      if (firstPlayer) {
        dispatch({
          type: actionTypes.SET_CURRENT_TURN,
          payload: {
            playerId: firstPlayer.id,
            playerName: firstPlayer.name,
            playerColor: firstPlayer.color,
            turnNumber: 1,
            timeRemaining: state.settings?.turnTimeLimit || 30,
          },
        });
      }

      const diceState = diceEngine.resetDiceState();
      dispatch({
        type: actionTypes.ROLL_DICE,
        payload: {
          value: diceState.value,
          isRolling: false,
          canRoll: true,
        },
      });

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [dispatch, state.players, state.settings]);

  const rollDice = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const diceState = diceEngine.rollDice(1, state.dice);
      const diceValue = diceState.value;

      dispatch({
        type: actionTypes.ROLL_DICE,
        payload: {
          value: diceValue,
          isRolling: false,
          canRoll: false,
        },
      });

      const isExtraTurn = diceEngine.shouldGrantExtraTurn(diceState);
      if (isExtraTurn) {
        dispatch({
          type: actionTypes.SET_CURRENT_TURN,
          payload: {
            ...state.currentTurn,
            timeRemaining: state.settings?.turnTimeLimit || 30,
          },
        });
      }

      setIsLoading(false);
      return { success: true, value: diceValue, isExtraTurn };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [dispatch, state.dice, state.currentTurn, state.settings]);

  const moveToken = useCallback(
    (tokenId, newPosition) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!tokenId) {
          throw new Error("Token ID is required");
        }

        if (newPosition === undefined || newPosition === null) {
          throw new Error("New position is required");
        }

        const token = tokenEngine.getTokenById(tokenId, state.board.tokens);
        if (!token) {
          throw new Error(`Token with ID ${tokenId} not found`);
        }

        dispatch({
          type: actionTypes.MOVE_TOKEN,
          payload: {
            tokenId,
            newPosition,
          },
        });

        const isFinished = tokenEngine.hasReachedHome(
          tokenId,
          state.board.tokens,
        );
        if (isFinished) {
          const winningTokens = tokenEngine.countWinningTokens(
            token.playerId,
            state.board.tokens,
          );
          if (winningTokens >= 4) {
            dispatch({
              type: actionTypes.SET_WINNER,
              payload: {
                playerId: token.playerId,
                playerName:
                  state.players.find((p) => p.id === token.playerId)?.name ||
                  null,
                playerColor: token.color,
                rank: 1,
              },
            });
          }
        }

        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [dispatch, state.board.tokens, state.players],
  );

  const restartGame = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const newBoard = generateBoard();
      const resetPlayers = state.players.map((player) => ({
        ...player,
        isWinner: false,
        rank: null,
        tokens: player.tokens.map((token) => ({
          ...token,
          position: -1,
          isHome: true,
          isWinner: false,
          isFinished: false,
          moveHistory: [],
        })),
      }));

      dispatch({
        type: actionTypes.SET_BOARD,
        payload: {
          cells: newBoard.cells,
          tokens: resetPlayers.flatMap((p) => p.tokens),
          lastMove: null,
        },
      });

      dispatch({
        type: actionTypes.SET_PLAYERS,
        payload: resetPlayers,
      });

      dispatch({
        type: actionTypes.SET_GAME_STATUS,
        payload: GAME_STATUS.READY,
      });

      dispatch({
        type: actionTypes.RESET_GAME,
      });

      const diceState = diceEngine.resetDiceState();
      dispatch({
        type: actionTypes.ROLL_DICE,
        payload: {
          value: diceState.value,
          isRolling: false,
          canRoll: false,
        },
      });

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [dispatch, state.players]);

  const gameAPI = useMemo(
    () => ({
      gameState: state,
      players: state.players,
      board: state.board,
      dice: state.dice,
      currentTurn: state.currentTurn,
      room: state.room,
      winner: state.winner,
      gameStatus: state.gameStatus,
      settings: state.settings,
      isLoading,
      error,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      rollDice,
      moveToken,
      restartGame,
    }),
    [
      state,
      isLoading,
      error,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      rollDice,
      moveToken,
      restartGame,
    ],
  );

  return gameAPI;
}

export default useLudoGame;
