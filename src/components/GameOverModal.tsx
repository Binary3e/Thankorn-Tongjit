import React from 'react';
import { Crown, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';
import { GameMode, GameStatus } from '../types';

interface GameOverModalProps {
  status: GameStatus;
  mode: GameMode;
  onRestart: () => void;
  onBackToMode: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  mode,
  onRestart,
  onBackToMode,
}) => {
  if (status === 'playing') return null;

  let title = '';
  let sub = '';
  let isWinner = false;

  if (status === 'player1_won') {
    if (mode === 'pve') {
      title = 'ยินดีด้วย! คุณชนะแล้ว';
      sub = 'คุณเอาชนะคอมพิวเตอร์ได้สำเร็จ!';
      isWinner = true;
    } else {
      title = 'ผู้เล่น 1 (ฝ่ายขาว) ชนะ!';
      sub = 'กินหมากหมดกระดาน หรืออีกฝ่ายไม่มีตาเดิน';
      isWinner = true;
    }
  } else if (status === 'player2_won') {
    if (mode === 'pve') {
      title = 'คอมพิวเตอร์ชนะ!';
      sub = 'ลองใหม่อีกครั้ง พัฒนากลยุทธ์เพื่อเอาชนะบอท';
      isWinner = false;
    } else {
      title = 'ผู้เล่น 2 (ฝ่ายแดง) ชนะ!';
      sub = 'กินหมากหมดกระดาน หรืออีกฝ่ายไม่มีตาเดิน';
      isWinner = true;
    }
  } else {
    title = 'ผลเสมอ!';
    sub = 'ทั้งสองฝ่ายไม่สามารถเดินต่อได้';
  }

  return (
    <div
      id="game-over-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        id="game-over-modal-content"
        className="w-full max-w-sm rounded-3xl bg-white border border-[#e3d7c7] p-6 sm:p-8 text-center shadow-2xl text-[#3e2311] relative space-y-5"
      >
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#5c2f0d] flex items-center justify-center shadow-md">
          {isWinner ? (
            <Trophy className="w-9 h-9 text-[#f4d193] animate-bounce" />
          ) : (
            <Crown className="w-9 h-9 text-[#f4d193]" />
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-[#3a1d08]">{title}</h2>
          <p className="text-sm text-[#7c5e47] leading-relaxed">{sub}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            id="modal-play-again-btn"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#7a3809] hover:bg-[#662e07] text-white font-bold text-base shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#f4d193]" />
            <span>เล่นใหม่อีกครั้ง</span>
          </button>

          <button
            id="modal-change-mode-btn"
            onClick={onBackToMode}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#f8f5f0] hover:bg-[#eae3d9] border border-[#dccdc0] text-[#5c2f0d] font-semibold text-sm transition-all active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้าเลือกโหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
