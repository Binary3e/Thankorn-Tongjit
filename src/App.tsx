import React, { useCallback, useEffect, useState } from 'react';
import {
  applyMove,
  chooseAIMove,
  createInitialBoard,
  evaluateGameStatus,
  getAllLegalMoves,
} from './rules';
import { AiDifficulty, Board, GameMode, GameStatus, Move, Piece, Player, Position } from './types';
import { sounds } from './audio';
import { ModeSelect } from './components/ModeSelect';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import { BookOpen, Shield } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'mode_select' | 'game'>('mode_select');
  const [mode, setMode] = useState<GameMode>('pve');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal');
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<Player>('player1');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [capturedByP1, setCapturedByP1] = useState<Piece[]>([]);
  const [capturedByP2, setCapturedByP2] = useState<Piece[]>([]);
  const [history, setHistory] = useState<
    {
      board: Board;
      turn: Player;
      capturedByP1: Piece[];
      capturedByP2: Piece[];
      lastMove: Move | null;
    }[]
  >([]);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Compute all valid legal moves for the current turn
  const { moves: currentLegalMoves, hasCaptures: isMandatoryCaptureActive } = getAllLegalMoves(
    board,
    turn
  );

  // Toggle sound setting
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Start new game with selected mode & difficulty
  const handleStartGame = (selectedMode: GameMode, selectedDifficulty?: AiDifficulty) => {
    setMode(selectedMode);
    if (selectedDifficulty) {
      setDifficulty(selectedDifficulty);
    }
    setBoard(createInitialBoard());
    setTurn('player1');
    setSelectedPos(null);
    setStatus('playing');
    setAiThinking(false);
    setLastMove(null);
    setCapturedByP1([]);
    setCapturedByP2([]);
    setHistory([]);
    setScreen('game');
  };

  // Restart current game
  const handleRestart = () => {
    sounds.playSelect();
    setBoard(createInitialBoard());
    setTurn('player1');
    setSelectedPos(null);
    setStatus('playing');
    setAiThinking(false);
    setLastMove(null);
    setCapturedByP1([]);
    setCapturedByP2([]);
    setHistory([]);
  };

  // Back to mode selection screen
  const handleBackToMode = () => {
    sounds.playSelect();
    setScreen('mode_select');
  };

  // Undo last move (in AI mode, undo 2 turns to go back to player's turn)
  const handleUndo = () => {
    if (history.length === 0 || aiThinking) return;

    sounds.playSelect();
    // In PvE mode: if it's currently P1's turn, undoing means going back before AI & Player's last moves (2 turns back)
    const stepCount = mode === 'pve' && history.length >= 2 ? 2 : 1;
    const targetIndex = history.length - stepCount;

    if (targetIndex >= 0) {
      const prev = history[targetIndex];
      setBoard(prev.board);
      setTurn(prev.turn);
      setCapturedByP1(prev.capturedByP1);
      setCapturedByP2(prev.capturedByP2);
      setLastMove(prev.lastMove);
      setSelectedPos(null);
      setStatus('playing');
      setHistory((prevH) => prevH.slice(0, targetIndex));
    } else {
      // Return to initial
      handleRestart();
    }
  };

  // Execute a move on the board
  const executeMove = useCallback(
    (move: Move) => {
      // Save snapshot in history
      setHistory((prev) => [
        ...prev,
        {
          board,
          turn,
          capturedByP1,
          capturedByP2,
          lastMove,
        },
      ]);

      const { newBoard, capturedPieces, promoted } = applyMove(board, move);
      setBoard(newBoard);
      setLastMove(move);
      setSelectedPos(null);

      // Update captured piece lists
      if (capturedPieces.length > 0) {
        if (move.player === 'player1') {
          setCapturedByP1((prev) => [...prev, ...capturedPieces]);
        } else {
          setCapturedByP2((prev) => [...prev, ...capturedPieces]);
        }
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      if (promoted) {
        sounds.playKing();
      }

      // Next player turn
      const nextTurn: Player = turn === 'player1' ? 'player2' : 'player1';
      const gameEval = evaluateGameStatus(newBoard, nextTurn);

      if (gameEval !== 'playing') {
        setStatus(gameEval);
        sounds.playWin();
      } else {
        setTurn(nextTurn);
      }
    },
    [board, turn, capturedByP1, capturedByP2, lastMove]
  );

  // Handle player clicking on board squares
  const handleSquareClick = (r: number, c: number) => {
    if (status !== 'playing' || aiThinking) return;

    // In PvE mode, human is player1
    if (mode === 'pve' && turn !== 'player1') return;

    const clickedPiece = board[r][c];

    // If a piece is already selected, check if clicked square is a valid destination
    if (selectedPos) {
      const matchedMove = currentLegalMoves.find(
        (m) =>
          m.from.r === selectedPos.r &&
          m.from.c === selectedPos.c &&
          m.to.r === r &&
          m.to.c === c
      );

      if (matchedMove) {
        executeMove(matchedMove);
        return;
      }
    }

    // If clicked on own piece with valid legal moves
    if (clickedPiece && clickedPiece.player === turn) {
      const pieceMoves = currentLegalMoves.filter((m) => m.from.r === r && m.from.c === c);
      if (pieceMoves.length > 0) {
        sounds.playSelect();
        setSelectedPos({ r, c });
      } else {
        // Piece cannot move (e.g. blocked or mandatory capture applies to other pieces)
        sounds.playSelect();
        setSelectedPos(null);
      }
    } else {
      setSelectedPos(null);
    }
  };

  // AI Turn Handler
  useEffect(() => {
    if (screen !== 'game' || mode !== 'pve' || turn !== 'player2' || status !== 'playing') {
      return;
    }

    setAiThinking(true);
    const timer = setTimeout(() => {
      const aiMove = chooseAIMove(board, 'player2', difficulty);
      if (aiMove) {
        executeMove(aiMove);
      } else {
        // AI has no moves, player 1 wins
        setStatus('player1_won');
        sounds.playWin();
      }
      setAiThinking(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [screen, mode, turn, status, board, difficulty, executeMove]);

  return (
    <div
      id="thai-checkers-app"
      className="min-h-screen w-full bg-[#f6f1ea] text-[#3e2311] flex flex-col items-center justify-between p-3 sm:p-5"
    >
      {screen === 'mode_select' ? (
        <ModeSelect
          onSelectMode={handleStartGame}
          onOpenRules={() => setIsRulesOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      ) : (
        <main className="w-full max-w-xl mx-auto flex flex-col items-center gap-3">
          {/* Header Controls & Status */}
          <GameHeader
            mode={mode}
            difficulty={difficulty}
            turn={turn}
            aiThinking={aiThinking}
            isMandatoryCaptureActive={isMandatoryCaptureActive}
            capturedByP1={capturedByP1}
            capturedByP2={capturedByP2}
            onRestart={handleRestart}
            onBackToMode={handleBackToMode}
            onOpenRules={() => setIsRulesOpen(true)}
            onUndo={handleUndo}
            canUndo={history.length > 0}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Game Board */}
          <GameBoard
            board={board}
            turn={turn}
            selectedPos={selectedPos}
            validMoves={currentLegalMoves}
            onSquareClick={handleSquareClick}
            lastMove={lastMove}
            isMandatoryCaptureActive={isMandatoryCaptureActive}
            disabled={status !== 'playing' || (mode === 'pve' && turn === 'player2')}
          />

          {/* Summary Box matching reference image */}
          <section
            id="how-to-play-summary"
            className="w-full mt-1 p-4 rounded-2xl bg-white border border-[#dccdc0] text-xs text-[#5d4432] space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between text-[#3a1d08] font-bold border-b border-[#e8ded3] pb-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#7a3809]" />
                สรุปกติกาเบื้องต้น
              </span>
              <button
                onClick={() => setIsRulesOpen(true)}
                className="text-xs text-[#5c2f0d] hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                อ่านกติกาทั้งหมด
              </button>
            </div>

            <ul className="space-y-1 pl-1 text-[11px] sm:text-xs leading-relaxed text-[#6b4e39]">
              <li>• แต่ละฝ่ายมีหมาก 8 ตัว วาง 2 แถวแรกบนช่องสีเข้ม</li>
              <li>• เบี้ยเดินและกินทแยงไปข้างหน้า (บังคับกิน &amp; กินต่อเนื่อง)</li>
              <li>• ถึงแถวหลังสุดเข้าเป็น "ฮอส" บินไกลได้ทุกทิศทาง</li>
            </ul>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto text-center py-3 text-xs text-[#8c7462]">
        หมากฮอสไทย (Thai Checkers) • กติกาไทยมาตรฐาน
      </footer>

      {/* Full Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Game Over Modal */}
      <GameOverModal
        status={status}
        mode={mode}
        onRestart={handleRestart}
        onBackToMode={handleBackToMode}
      />
    </div>
  );
}
