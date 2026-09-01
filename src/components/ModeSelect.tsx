import React, { useState } from 'react';
import { Bot, BookOpen, Crown, Shield, Users, Volume2, VolumeX } from 'lucide-react';
import { AiDifficulty, GameMode } from '../types';
import { sounds } from '../audio';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode, difficulty?: AiDifficulty) => void;
  onOpenRules: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({
  onSelectMode,
  onOpenRules,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AiDifficulty>('normal');

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-[#f6f1ea] text-[#3e2311]">
      {/* Top Header Row matching the image */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#5c2f0d] flex items-center justify-center shadow-xs">
            <Crown className="w-5 h-5 text-[#f4d193]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#3a1d08] leading-tight">หมากฮอสไทย</h2>
            <p className="text-[11px] text-[#7c5e47] leading-tight">Thai Checkers Standard</p>
          </div>
        </div>

        {/* Sound toggle button */}
        <button
          id="mode-sound-toggle-btn"
          onClick={() => {
            sounds.playSelect();
            onToggleSound();
          }}
          className="p-2 rounded-xl bg-[#ebe3d7] hover:bg-[#dfd5c7] text-[#5c2f0d] transition-all cursor-pointer"
          title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
          aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#a39081]" />}
        </button>
      </div>

      {/* Main White Card matching reference screenshot */}
      <div
        id="mode-select-card"
        className="w-full max-w-md rounded-3xl bg-white border border-[#e3d7c7] shadow-[0_10px_35px_rgba(74,40,16,0.08)] p-6 sm:p-8 space-y-6"
      >
        {/* Card Header Icon & Titles */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5c2f0d] text-[#f4d193] shadow-md flex items-center justify-center mb-3">
            <Crown className="w-9 h-9 text-[#f4d193]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3a1d08] tracking-tight">
            หมากฮอสไทย
          </h1>
          <p className="text-sm text-[#7c5e47] font-medium mt-0.5">
            Thai Checkers Standard
          </p>
        </div>

        {/* Option 1: เล่น 2 คน */}
        <div
          id="select-pvp-card"
          onClick={() => {
            sounds.playSelect();
            onSelectMode('pvp');
          }}
          className="w-full p-4 rounded-2xl border border-[#dccdc0] bg-[#fcfaf7] hover:bg-white hover:border-[#b89578] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#5c2f0d] text-[#f2e2d0] flex items-center justify-center shadow-xs">
              <Users className="w-6 h-6 text-[#f4d193]" />
            </div>
            <span className="text-base sm:text-lg font-bold text-[#3a1d08]">
              เล่น 2 คน
            </span>
          </div>

          <div className="flex items-center text-sm font-semibold text-[#5c2f0d] group-hover:translate-x-1 transition-transform">
            <span>เริ่มเล่น</span>
            <span className="ml-1 text-base">→</span>
          </div>
        </div>

        {/* Option 2: เล่นกับคอมพิวเตอร์ */}
        <div
          id="select-pve-card"
          className="w-full p-4 sm:p-5 rounded-2xl border border-[#dccdc0] bg-[#fcfaf7] space-y-4 shadow-xs"
        >
          {/* Header row */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#5c2f0d] text-[#f2e2d0] flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6 text-[#f4d193]" />
            </div>
            <span className="text-base sm:text-lg font-bold text-[#3a1d08]">
              เล่นกับคอมพิวเตอร์
            </span>
          </div>

          {/* AI Difficulty Selector Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs sm:text-sm font-medium text-[#7c5e47]">
              ระดับ AI:
            </span>

            <div className="bg-[#eae3d9] p-1 rounded-xl flex items-center gap-1">
              {(
                [
                  { id: 'easy', label: 'มือใหม่' },
                  { id: 'normal', label: 'มาตรฐาน' },
                  { id: 'hard', label: 'เซียน' },
                ] as const
              ).map((diff) => {
                const isActive = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    id={`diff-btn-${diff.id}`}
                    onClick={() => {
                      sounds.playSelect();
                      setSelectedDifficulty(diff.id);
                    }}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5c2f0d] text-white shadow-xs'
                        : 'text-[#6d503b] hover:text-[#3a1d08]'
                    }`}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big CTA Button */}
          <button
            id="start-ai-game-btn"
            onClick={() => {
              sounds.playSelect();
              onSelectMode('pve', selectedDifficulty);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#7a3809] hover:bg-[#662e07] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <span>เริ่มเล่นกับคอมพิวเตอร์</span>
            <span>→</span>
          </button>
        </div>

        {/* Separator / Rules Link */}
        <div className="pt-1">
          <div className="w-full border-t border-[#e8ded3] mb-4" />
          <button
            id="open-rules-link-btn"
            onClick={() => {
              sounds.playSelect();
              onOpenRules();
            }}
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#5c2f0d] hover:text-[#7a3809] hover:underline cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#5c2f0d]" />
            <span>อ่านคำอธิบายกติกาและวิธีเล่น</span>
          </button>
        </div>

        {/* Summary Info Box */}
        <div className="rounded-2xl border border-[#dccdc0] bg-[#fcfaf7] p-4 text-xs text-[#5d4432] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#3a1d08]">
            <Shield className="w-4 h-4 text-[#7a3809]" />
            <span>สรุปกติกาเบื้องต้น:</span>
          </div>
          <ul className="space-y-1 pl-1 text-[11px] sm:text-xs leading-relaxed text-[#6b4e39]">
            <li>• แต่ละฝ่ายมีหมาก 8 ตัว วาง 2 แถวแรกบนช่องสีเข้ม</li>
            <li>• เบี้ยเดินและกินทแยงไปข้างหน้า (บังคับกิน &amp; กินต่อเนื่อง)</li>
            <li>• ถึงแถวหลังสุดเข้าเป็น "ฮอส" บินไกลได้ทุกทิศทาง</li>
          </ul>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="text-center py-4 text-xs text-[#8c7462] font-normal">
        หมากฮอสไทย (Thai Checkers) • กติกาไทยมาตรฐาน
      </footer>
    </div>
  );
};
