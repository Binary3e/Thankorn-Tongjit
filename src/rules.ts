import { AiDifficulty, Board, GameMode, Move, Piece, Player, Position, Step } from './types';

export const BOARD_SIZE = 8;

export function isDarkSquare(r: number, c: number): boolean {
  return (r + c) % 2 === 1;
}

export function isValidPos(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/**
 * Initialize 8x8 Thai Checkers board
 * Player 1 (Bottom - White/Light) on rows 6, 7
 * Player 2 (Top - Red/Dark / AI) on rows 0, 1
 * Total 8 pieces each
 */
export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  let idCounter = 1;

  // Player 2 pieces (Top, rows 0 and 1)
  for (let r = 0; r <= 1; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isDarkSquare(r, c)) {
        board[r][c] = {
          id: `p2_${idCounter++}`,
          player: 'player2',
          type: 'man',
        };
      }
    }
  }

  // Player 1 pieces (Bottom, rows 6 and 7)
  for (let r = 6; r <= 7; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isDarkSquare(r, c)) {
        board[r][c] = {
          id: `p1_${idCounter++}`,
          player: 'player1',
          type: 'man',
        };
      }
    }
  }

  return board;
}

/**
 * Check if a piece at position reaches promotion rank
 */
export function shouldPromote(player: Player, r: number): boolean {
  return (player === 'player1' && r === 0) || (player === 'player2' && r === BOARD_SIZE - 1);
}

/**
 * Get simple (non-capturing) moves for a normal man piece
 */
function getManSimpleMoves(board: Board, r: number, c: number, piece: Piece): Move[] {
  const moves: Move[] = [];
  const forward = piece.player === 'player1' ? -1 : 1;
  const targetR = r + forward;

  for (const dc of [-1, 1]) {
    const targetC = c + dc;
    if (isValidPos(targetR, targetC) && board[targetR][targetC] === null) {
      const becomesKing = shouldPromote(piece.player, targetR);
      moves.push({
        pieceId: piece.id,
        player: piece.player,
        from: { r, c },
        to: { r: targetR, c: targetC },
        steps: [
          {
            from: { r, c },
            to: { r: targetR, c: targetC },
            promoted: becomesKing,
          },
        ],
        capturedPositions: [],
        becomesKing,
      });
    }
  }

  return moves;
}

/**
 * Get simple (non-capturing) moves for a King piece (Flying King in all 4 diagonals)
 */
function getKingSimpleMoves(board: Board, r: number, c: number, piece: Piece): Move[] {
  const moves: Move[] = [];
  const directions = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ];

  for (const { dr, dc } of directions) {
    let currR = r + dr;
    let currC = c + dc;

    while (isValidPos(currR, currC) && board[currR][currC] === null) {
      moves.push({
        pieceId: piece.id,
        player: piece.player,
        from: { r, c },
        to: { r: currR, c: currC },
        steps: [
          {
            from: { r, c },
            to: { r: currR, c: currC },
            promoted: false,
          },
        ],
        capturedPositions: [],
        becomesKing: false,
      });
      currR += dr;
      currC += dc;
    }
  }

  return moves;
}

interface JumpSequence {
  steps: Step[];
  capturedPositions: Position[];
  finalPos: Position;
  isKing: boolean;
}

/**
 * Recursive search for all capture sequences for a normal man piece
 * Thai rule: Normal piece can only capture forward.
 */
function findManCaptures(
  board: Board,
  currPos: Position,
  initialPos: Position,
  piece: Piece,
  currentSteps: Step[],
  capturedPositions: Position[],
  isKing: boolean
): JumpSequence[] {
  // If piece became King during this sequence, search as king from this point
  if (isKing) {
    return findKingCaptures(
      board,
      currPos,
      initialPos,
      piece,
      currentSteps,
      capturedPositions
    );
  }

  const forward = piece.player === 'player1' ? -1 : 1;
  const oppPlayer = piece.player === 'player1' ? 'player2' : 'player1';
  let foundDeeper = false;
  const sequences: JumpSequence[] = [];

  for (const dc of [-1, 1]) {
    const enemyR = currPos.r + forward;
    const enemyC = currPos.c + dc;
    const landR = currPos.r + 2 * forward;
    const landC = currPos.c + 2 * dc;

    if (isValidPos(landR, landC) && isValidPos(enemyR, enemyC)) {
      const enemyPiece = board[enemyR][enemyC];
      const isEnemyCaptured = capturedPositions.some((p) => p.r === enemyR && p.c === enemyC);
      const isLandEmpty = board[landR][landC] === null;

      if (enemyPiece && enemyPiece.player === oppPlayer && !isEnemyCaptured && isLandEmpty) {
        foundDeeper = true;
        const promoted = shouldPromote(piece.player, landR);
        const newStep: Step = {
          from: currPos,
          to: { r: landR, c: landC },
          capturedPos: { r: enemyR, c: enemyC },
          promoted,
        };
        const nextSteps = [...currentSteps, newStep];
        const nextCaptured = [...capturedPositions, { r: enemyR, c: enemyC }];

        // Temporarily simulate move on board
        const tempPiece = board[currPos.r][currPos.c];
        board[currPos.r][currPos.c] = null;
        board[landR][landC] = tempPiece;

        const subSequences = findManCaptures(
          board,
          { r: landR, c: landC },
          initialPos,
          piece,
          nextSteps,
          nextCaptured,
          promoted
        );

        // Revert temporary simulation
        board[currPos.r][currPos.c] = tempPiece;
        board[landR][landC] = null;

        sequences.push(...subSequences);
      }
    }
  }

  if (!foundDeeper && currentSteps.length > 0) {
    return [
      {
        steps: currentSteps,
        capturedPositions,
        finalPos: currPos,
        isKing,
      },
    ];
  }

  return sequences;
}

/**
 * Recursive search for all capture sequences for a King piece
 * Thai rule: Flying King can jump along any diagonal, over an enemy piece, and land on ANY empty square behind it.
 */
function findKingCaptures(
  board: Board,
  currPos: Position,
  initialPos: Position,
  piece: Piece,
  currentSteps: Step[],
  capturedPositions: Position[]
): JumpSequence[] {
  const oppPlayer = piece.player === 'player1' ? 'player2' : 'player1';
  const directions = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ];

  let foundDeeper = false;
  const sequences: JumpSequence[] = [];

  for (const { dr, dc } of directions) {
    let r = currPos.r + dr;
    let c = currPos.c + dc;

    // Fly through empty squares until an obstacle is found
    while (isValidPos(r, c) && board[r][c] === null) {
      r += dr;
      c += dc;
    }

    // Check if obstacle is an un-captured enemy piece
    if (isValidPos(r, c)) {
      const obstacle = board[r][c];
      const isCaptured = capturedPositions.some((p) => p.r === r && p.c === c);

      if (obstacle && obstacle.player === oppPlayer && !isCaptured) {
        const enemyPos = { r, c };
        // Any empty square beyond this enemy piece is a valid landing spot
        let landR = r + dr;
        let landC = c + dc;

        while (isValidPos(landR, landC) && board[landR][landC] === null) {
          foundDeeper = true;
          const newStep: Step = {
            from: currPos,
            to: { r: landR, c: landC },
            capturedPos: enemyPos,
            promoted: false,
          };
          const nextSteps = [...currentSteps, newStep];
          const nextCaptured = [...capturedPositions, enemyPos];

          // Temporarily simulate move
          const tempPiece = board[currPos.r][currPos.c];
          board[currPos.r][currPos.c] = null;
          board[landR][landC] = tempPiece;

          const subSequences = findKingCaptures(
            board,
            { r: landR, c: landC },
            initialPos,
            piece,
            nextSteps,
            nextCaptured
          );

          // Revert
          board[currPos.r][currPos.c] = tempPiece;
          board[landR][landC] = null;

          sequences.push(...subSequences);

          landR += dr;
          landC += dc;
        }
      }
    }
  }

  if (!foundDeeper && currentSteps.length > 0) {
    return [
      {
        steps: currentSteps,
        capturedPositions,
        finalPos: currPos,
        isKing: true,
      },
    ];
  }

  return sequences;
}

/**
 * Get all capture moves for a piece
 */
export function getPieceCaptures(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];

  const sequences =
    piece.type === 'king'
      ? findKingCaptures(board, { r, c }, { r, c }, piece, [], [])
      : findManCaptures(board, { r, c }, { r, c }, piece, [], [], false);

  if (sequences.length === 0) return [];

  // In Thai Checkers: You must capture to completion of the chosen chain
  // Find max length of jump in this piece's paths to keep only maximal jumps for this piece path
  const maxCaptures = Math.max(...sequences.map((s) => s.capturedPositions.length));
  const fullSequences = sequences.filter((s) => s.capturedPositions.length === maxCaptures);

  return fullSequences.map((seq) => ({
    pieceId: piece.id,
    player: piece.player,
    from: { r, c },
    to: seq.finalPos,
    steps: seq.steps,
    capturedPositions: seq.capturedPositions,
    becomesKing: piece.type === 'king' || seq.isKing,
  }));
}

/**
 * Get all valid moves for a player across the entire board,
 * applying mandatory capture (กติกาบังคับกิน) rules.
 */
export function getAllLegalMoves(board: Board, player: Player): { moves: Move[]; hasCaptures: boolean } {
  const allCaptures: Move[] = [];
  const allSimpleMoves: Move[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const captures = getPieceCaptures(board, r, c);
        if (captures.length > 0) {
          allCaptures.push(...captures);
        } else {
          const simple =
            piece.type === 'king'
              ? getKingSimpleMoves(board, r, c, piece)
              : getManSimpleMoves(board, r, c, piece);
          allSimpleMoves.push(...simple);
        }
      }
    }
  }

  // Mandatory capture rule: If any captures are possible, player MUST capture
  if (allCaptures.length > 0) {
    return {
      moves: allCaptures,
      hasCaptures: true,
    };
  }

  return {
    moves: allSimpleMoves,
    hasCaptures: false,
  };
}

/**
 * Execute a move on the board and return the new board state and captured pieces
 */
export function applyMove(
  board: Board,
  move: Move
): { newBoard: Board; capturedPieces: Piece[]; promoted: boolean } {
  const newBoard = cloneBoard(board);
  const movingPiece = newBoard[move.from.r][move.from.c];

  if (!movingPiece) {
    throw new Error('No piece at source position');
  }

  const capturedPieces: Piece[] = [];

  // Remove captured pieces
  for (const capPos of move.capturedPositions) {
    const captured = newBoard[capPos.r][capPos.c];
    if (captured) {
      capturedPieces.push(captured);
      newBoard[capPos.r][capPos.c] = null;
    }
  }

  // Move the piece to final destination
  newBoard[move.from.r][move.from.c] = null;
  const isPromoted = move.becomesKing || movingPiece.type === 'king';

  newBoard[move.to.r][move.to.c] = {
    ...movingPiece,
    type: isPromoted ? 'king' : 'man',
  };

  return {
    newBoard,
    capturedPieces,
    promoted: isPromoted && movingPiece.type !== 'king',
  };
}

/**
 * Check game status: winner or still playing
 */
export function evaluateGameStatus(
  board: Board,
  nextTurn: Player
): 'playing' | 'player1_won' | 'player2_won' {
  let p1Pieces = 0;
  let p2Pieces = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.player === 'player1') p1Pieces++;
        if (piece.player === 'player2') p2Pieces++;
      }
    }
  }

  if (p1Pieces === 0) return 'player2_won';
  if (p2Pieces === 0) return 'player1_won';

  // Check if next player has any legal moves left
  const { moves } = getAllLegalMoves(board, nextTurn);
  if (moves.length === 0) {
    // Current player cannot move, so opponent wins
    return nextTurn === 'player1' ? 'player2_won' : 'player1_won';
  }

  return 'playing';
}

/**
 * AI Move Selection:
 * Supports 3 difficulties:
 * - 'easy' (มือใหม่): Follows mandatory rules, random selection
 * - 'normal' (มาตรฐาน): Prioritizes max captures, promotion, and forward progress
 * - 'hard' (เซียน): Strategic evaluation (piece counts, king value, avoidance of opponent traps)
 */
export function chooseAIMove(
  board: Board,
  aiPlayer: Player = 'player2',
  difficulty: AiDifficulty = 'normal'
): Move | null {
  const { moves, hasCaptures } = getAllLegalMoves(board, aiPlayer);

  if (moves.length === 0) return null;

  if (hasCaptures) {
    // Find maximum capture count
    const maxCaptures = Math.max(...moves.map((m) => m.capturedPositions.length));
    const bestCaptureMoves = moves.filter((m) => m.capturedPositions.length === maxCaptures);

    if (difficulty === 'easy') {
      // In easy mode, pick any valid capture move randomly
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (difficulty === 'normal') {
      return bestCaptureMoves[Math.floor(Math.random() * bestCaptureMoves.length)];
    }

    // Hard mode: evaluate each best capture move's resulting board
    return evaluateBestMove(board, bestCaptureMoves, aiPlayer);
  }

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'normal') {
    // Score moves simply: promote > advance > protect
    const scored = moves.map((m) => {
      let score = 0;
      if (m.becomesKing) score += 50;
      // Moving forward towards promotion
      score += (m.to.r - m.from.r) * 5;
      // Center control
      if (m.to.c >= 2 && m.to.c <= 5) score += 3;
      return { move: m, score: score + Math.random() * 5 };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  // Hard mode:
  return evaluateBestMove(board, moves, aiPlayer);
}

function evaluateBestMove(board: Board, candidateMoves: Move[], aiPlayer: Player): Move {
  const oppPlayer = aiPlayer === 'player1' ? 'player2' : 'player1';

  const scoredMoves = candidateMoves.map((m) => {
    const { newBoard } = applyMove(board, m);
    let score = 0;

    // AI piece valuation
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = newBoard[r][c];
        if (p) {
          const val = p.type === 'king' ? 35 : 10;
          const posVal = p.player === aiPlayer ? (aiPlayer === 'player2' ? r * 1.5 : (7 - r) * 1.5) : 0;
          if (p.player === aiPlayer) {
            score += val + posVal;
          } else {
            score -= val;
          }
        }
      }
    }

    // Check opponent's replies: if opponent can capture us immediately, penalize
    const oppMoves = getAllLegalMoves(newBoard, oppPlayer);
    if (oppMoves.hasCaptures) {
      const oppMaxCap = Math.max(...oppMoves.moves.map((om) => om.capturedPositions.length));
      score -= oppMaxCap * 25;
    }

    // Favor king creation
    if (m.becomesKing) score += 40;

    return { move: m, score: score + Math.random() * 2 };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}
