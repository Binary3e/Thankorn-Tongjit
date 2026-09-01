import React from 'react';
import {
  ArrowLeft,
  Bot,
  Crown,
  HelpCircle,
  RotateCcw,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { AiDifficulty, GameMode, Piece, Player } from '../types';

interface GameHeaderProps {
  mode: GameMode;
  difficulty?: AiDifficulty;
  turn: Player;
  aiThinking: boolean;
  isMandatoryCaptureActive: boolean;
  capturedByP1: Piece[];
  capturedByP2: Piece[];
  onRestart: () => void;
  onBackToMode: () => void;
  onOpenRules: () => void;
  onUndo: () => void;
  canUndo: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  difficulty = 'normal',
  turn,
  aiThinking,
  isMandatoryCaptureActive,
  capturedByP1,
  capturedByP2,
  onRestart,
  onBackToMode,
  onOpenRules,
  onUndo,
  canUndo,
  soundEnabled,
  onToggleSound,
}) => {
  const isP1Turn = turn === 'player1';

  const diffLabel =
    difficulty === 'easy' ? 'มือใหม่' : difficulty === 'hard' ? 'เซียน' : 'มาตรฐาน';

  const p1Label = mode === 'pve' ? 'คุณ (ฝ่ายขาว)' : 'ผู้เล่น 1 (ฝ่ายขาว)';
  const p2Label = mode === 'pve' ? 'คอมพิวเตอร์ (ฝ่ายแดง)' : 'ผู้เล่น 2 (ฝ่ายแดง)';

  return (
    <header className="w-full max-w-xl mx-auto space-y-3 mb-2 px-1 select-none">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          id="back-to-mode-btn"
          onClick={onBackToMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f3ede4] border border-[#dccdc0] text-[#5c2f0d] text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
          title="ย้อนกลับไปเลือกโหมด"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>เลือกโหมด</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Rules Button */}
          <button
            id="open-rules-btn"
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#f3ede4] border border-[#dccdc0] text-[#5c2f0d] text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
            title="วิธีเล่นหมากฮอส"
          >
            <HelpCircle className="w-4 h-4 text-[#7a3809]" />
            <span className="hidden sm:inline">วิธีเล่น</span>
          </button>

          {/* Undo Move Button */}
          <button
            id="undo-move-btn"
            onClick={onUndo}
            disabled={!canUndo || aiThinking}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-[#f3ede4] border border-[#dccdc0] text-[#5c2f0d] text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-xs flex items-center gap-1 cursor-pointer"
            title="ย้อนตาเดิน"
          >
            <Undo2 className="w-4 h-4 text-[#7a3809]" />
            <span className="hidden sm:inline">ย้อน</span>
          </button>

          {/* Restart Button */}
          <button
            id="restart-game-btn"
            onClick={onRestart}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#7a3809] hover:bg-[#662e07] text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            title="เริ่มเกมใหม่"
          >
            <RotateCcw className="w-4 h-4 text-[#f4d193]" />
            <span>เริ่มใหม่</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-white hover:bg-[#f3ede4] border border-[#dccdc0] text-[#5c2f0d] transition-all active:scale-95 shadow-xs cursor-pointer"
            title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#a39081]" />}
          </button>
        </div>
      </div>

      {/* Players Status Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Player 2 (Top - Dark) */}
        <div
          id="player2-status-card"
          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
            !isP1Turn
              ? 'bg-white border-[#8b4513] shadow-[0_4px_16px_rgba(139,69,19,0.15)] ring-2 ring-[#8b4513]/30'
              : 'bg-[#f8f5f0] border-[#e2d6c7] opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* Dark Piece Token */}
            <div className="w-7 h-7 rounded-full bg-[#4a180f] border-2 border-[#7a2a1b] shadow-xs flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7a2a1b]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#3a1d08] flex items-center gap-1">
                <span>{p2Label}</span>
                {mode === 'pve' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#eae3d9] text-[#5c2f0d] font-normal">
                    {diffLabel}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-medium">
                {!isP1Turn ? (
                  aiThinking ? (
                    <span className="text-[#8b4513] animate-pulse font-semibold">กำลังคิด...</span>
                  ) : (
                    <span className="font-bold text-[#8b4513]">● ถึงตาเดิน</span>
                  )
                ) : (
                  <span className="text-[#8c7462]">รอตาเดิน</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right pl-1">
            <span className="text-[10px] text-[#8c7462] block leading-none">กินได้</span>
            <span className="text-sm sm:text-base font-extrabold text-[#5c2f0d]">
              {capturedByP2.length}
            </span>
          </div>
        </div>

        {/* Player 1 (Bottom - White) */}
        <div
          id="player1-status-card"
          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
            isP1Turn
              ? 'bg-white border-[#8b4513] shadow-[0_4px_16px_rgba(139,69,19,0.15)] ring-2 ring-[#8b4513]/30'
              : 'bg-[#f8f5f0] border-[#e2d6c7] opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* White Piece Token */}
            <div className="w-7 h-7 rounded-full bg-[#fbf8f2] border-2 border-[#cfbfae] shadow-xs flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#cfbfae]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#3a1d08] flex items-center gap-1">
                <span>{p1Label}</span>
                {mode === 'pvp' && <Users className="w-3.5 h-3.5 text-[#7a3809]" />}
              </div>
              <div className="text-[11px] font-medium">
                {isP1Turn ? (
                  <span className="font-bold text-emerald-700">● ถึงตาของคุณ</span>
                ) : (
                  <span className="text-[#8c7462]">รอตาเดิน</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right pl-1">
            <span className="text-[10px] text-[#8c7462] block leading-none">กินได้</span>
            <span className="text-sm sm:text-base font-extrabold text-[#5c2f0d]">
              {capturedByP1.length}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Capture Banner Alert */}
      {isMandatoryCaptureActive && (
        <div
          id="mandatory-capture-banner"
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#faeceb] border border-[#e57373] shadow-xs text-[#b71c1c] text-xs sm:text-sm font-bold animate-pulse"
        >
          <Zap className="w-4 h-4 text-[#c62828] fill-[#c62828]" />
          <span>กติกาบังคับกิน! คุณมีหมากที่สามารถกินได้ในตานี้</span>
        </div>
      )}
    </header>
  );
};
