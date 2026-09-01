import React from 'react';
import { Crown, Target } from 'lucide-react';
import { Board, Move, Piece, Player, Position } from '../types';
import { BOARD_SIZE, isDarkSquare } from '../rules';

interface GameBoardProps {
  board: Board;
  turn: Player;
  selectedPos: Position | null;
  validMoves: Move[];
  onSquareClick: (r: number, c: number) => void;
  lastMove: Move | null;
  isMandatoryCaptureActive: boolean;
  disabled: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  turn,
  selectedPos,
  validMoves,
  onSquareClick,
  lastMove,
  isMandatoryCaptureActive,
  disabled,
}) => {
  // Find which positions are valid destination squares for the currently selected piece
  const validDestinations = selectedPos
    ? validMoves
        .filter((m) => m.from.r === selectedPos.r && m.from.c === selectedPos.c)
        .map((m) => ({
          pos: m.to,
          isCapture: m.capturedPositions.length > 0,
          capturedPositions: m.capturedPositions,
        }))
    : [];

  // Find all pieces of current turn that have valid moves
  const movablePieces = validMoves.map((m) => `${m.from.r},${m.from.c}`);

  // Board coordinate notations (1-8 and Thai letters ก-ซ)
  const colLabels = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ'];
  const rowLabels = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div
      id="game-board-container"
      className="relative w-full max-w-[460px] sm:max-w-[500px] aspect-square mx-auto p-3 sm:p-4 rounded-3xl bg-[#3d1e0a] border-4 border-[#6d3c1b] shadow-[0_15px_40px_rgba(61,30,10,0.35)] select-none touch-manipulation"
    >
      {/* Board Inner Frame */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#54280d] grid grid-cols-8 grid-rows-8 bg-[#3d1e0a] shadow-inner">
        {Array.from({ length: BOARD_SIZE }).map((_, r) =>
          Array.from({ length: BOARD_SIZE }).map((_, c) => {
            const isDark = isDarkSquare(r, c);
            const piece = board[r][c];
            const isSelected = selectedPos?.r === r && selectedPos?.c === c;

            // Check if this square is a valid target destination
            const targetMove = validDestinations.find((d) => d.pos.r === r && d.pos.c === c);
            const isValidDestination = Boolean(targetMove);

            // Check if this square was part of previous move
            const isLastMoveFrom = lastMove?.from.r === r && lastMove?.from.c === c;
            const isLastMoveTo = lastMove?.to.r === r && lastMove?.to.c === c;

            // Check if this piece has legal moves
            const isMovable = movablePieces.includes(`${r},${c}`);
            const isMustCapture = isMandatoryCaptureActive && isMovable && piece?.player === turn;

            return (
              <div
                key={`sq-${r}-${c}`}
                id={`square-${r}-${c}`}
                onClick={() => !disabled && onSquareClick(r, c)}
                className={`relative flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  isDark
                    ? 'bg-[#5a2e12] hover:brightness-110 active:brightness-95'
                    : 'bg-[#ebd5b5]'
                } ${isSelected ? 'ring-3 ring-[#f4d193] ring-inset z-10' : ''}`}
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(135deg, #5a2e12 0%, #43210b 100%)'
                    : 'linear-gradient(135deg, #ebd5b5 0%, #dec29f 100%)',
                }}
              >
                {/* Last move trail highlight */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div className="absolute inset-0 bg-[#eab308]/20 pointer-events-none" />
                )}

                {/* Coordinate notations */}
                {c === 0 && (
                  <span className="absolute top-0.5 left-1 text-[9px] font-bold text-[#8d6244]/80 pointer-events-none select-none">
                    {rowLabels[r]}
                  </span>
                )}
                {r === 7 && (
                  <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-[#8d6244]/80 pointer-events-none select-none">
                    {colLabels[c]}
                  </span>
                )}

                {/* Piece Rendering */}
                {piece && (
                  <div
                    className={`relative w-[82%] h-[82%] rounded-full flex items-center justify-center transition-transform duration-200 ${
                      isSelected ? 'scale-105 shadow-xl' : 'shadow-md'
                    } ${
                      isMustCapture
                        ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#3d1e0a] animate-pulse'
                        : ''
                    }`}
                  >
                    {piece.player === 'player1' ? (
                      /* Player 1 Piece (Light Ivory Wood) */
                      <div
                        id={`piece-${piece.id}`}
                        className="w-full h-full rounded-full bg-linear-to-b from-[#fdfbf7] via-[#f3ede3] to-[#ded2c1] border-2 border-[#b8a795] shadow-[0_3px_6px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center"
                      >
                        <div className="w-[72%] h-[72%] rounded-full border border-[#c9baab] flex items-center justify-center bg-radial from-[#ffffff]/60 to-transparent">
                          {piece.type === 'king' ? (
                            <div className="flex flex-col items-center justify-center text-[#7a3809]">
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs fill-[#f4c430] stroke-[#7a3809] stroke-[1.8]" />
                              <span className="text-[7.5px] font-bold tracking-tighter text-[#7a3809] -mt-0.5">
                                ฮอส
                              </span>
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#baa692]/60 shadow-inner" />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Player 2 Piece (Rich Mahogany Wood) */
                      <div
                        id={`piece-${piece.id}`}
                        className="w-full h-full rounded-full bg-linear-to-b from-[#4a180f] via-[#330f08] to-[#1e0704] border-2 border-[#6d2417] shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center"
                      >
                        <div className="w-[72%] h-[72%] rounded-full border border-[#782c1e]/70 flex items-center justify-center bg-radial from-[#9c3422]/30 to-transparent">
                          {piece.type === 'king' ? (
                            <div className="flex flex-col items-center justify-center text-[#f4d193]">
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs fill-[#f4d193] stroke-[#e6a84f] stroke-[1.8]" />
                              <span className="text-[7.5px] font-bold tracking-tighter text-[#f4d193] -mt-0.5">
                                ฮอส
                              </span>
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#6d2417]/90 shadow-inner" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Valid Destination Indicator */}
                {isValidDestination && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {targetMove?.isCapture ? (
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-600/30 border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse">
                        <Target className="w-4 h-4 text-red-200" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
