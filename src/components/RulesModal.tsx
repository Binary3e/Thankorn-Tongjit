import React from 'react';
import { BookOpen, CheckCircle, Crown, ShieldAlert, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="rules-modal-content"
        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#e3d7c7] shadow-2xl p-6 text-[#3e2311] my-8 max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e8ded3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5c2f0d] text-[#f4d193] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3a1d08]">กติกาหมากฮอสไทย</h2>
              <p className="text-xs text-[#7c5e47]">คู่มือวิธีเล่นและกติกามาตรฐาน</p>
            </div>
          </div>
          <button
            id="close-rules-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7c5e47] hover:text-[#3a1d08] hover:bg-[#f3ede4] transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Body */}
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
          {/* Rule 1: การเดินของเบี้ย */}
          <div className="p-4 rounded-2xl bg-[#fcfaf7] border border-[#dccdc0] space-y-1.5">
            <div className="flex items-center gap-2 text-[#5c2f0d] font-bold">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#5c2f0d] text-xs text-[#f4d193]">
                1
              </span>
              <span>การเดินของเบี้ย (ธรรมดา)</span>
            </div>
            <p className="text-[#5d4432] pl-7">
              เบี้ยสามารถเดินเฉียงไปข้างหน้าได้ทีละ <strong>1 ช่อง</strong> ไปยังช่องสีเข้มที่ว่างอยู่
              (ห้ามเดินถอยหลัง)
            </p>
          </div>

          {/* Rule 2: การกินและบังคับกิน */}
          <div className="p-4 rounded-2xl bg-[#fef7f6] border border-[#f5c6cb] space-y-1.5">
            <div className="flex items-center gap-2 text-[#b71c1c] font-bold">
              <ShieldAlert className="w-5 h-5 text-[#c62828]" />
              <span>การกิน &amp; กติกาบังคับกิน (สำคัญ!)</span>
            </div>
            <div className="text-[#5d4432] pl-7 space-y-1">
              <p>• เบี้ยกินได้โดยการกระโดดข้ามหมากฝ่ายตรงข้ามในแนวทแยงไปข้างหน้า ลงในช่องว่างถัดไป</p>
              <p>• <strong>บังคับกิน:</strong> หากในตานั้นมีหมากที่สามารถกินได้ ผู้เล่น<strong>ต้องกินเท่านั้น</strong> จะเดินตาธรรมดาไม่ได้</p>
              <p>• <strong>กินต่อเนื่อง:</strong> ถ้ากินแล้วสามารถกินต่อได้อีกในตาเดียวกัน ต้องกินให้หมดจนจบจังหวะ</p>
            </div>
          </div>

          {/* Rule 3: การเข้าฮอส */}
          <div className="p-4 rounded-2xl bg-[#fcfaf7] border border-[#dccdc0] space-y-1.5">
            <div className="flex items-center gap-2 text-[#7a3809] font-bold">
              <Crown className="w-5 h-5 text-[#f4c430]" />
              <span>การเข้าฮอส (King)</span>
            </div>
            <div className="text-[#5d4432] pl-7 space-y-1">
              <p>เมื่อเบี้ยเดินไปถึงแถวสุดท้ายของฝั่งตรงข้าม จะกลายเป็น <strong>"ฮอส"</strong> (มีมงกุฎ)</p>
              <p>• <strong>การเดินของฮอส:</strong> เดินทะลุได้หลายช่องในแนวทแยง ทั้งเดินหน้าและถอยหลัง (บินได้)</p>
              <p>• <strong>การกินของฮอส:</strong> กระโดดข้ามหมากฝ่ายตรงข้ามในแนวทแยง และเลือกวางลงในช่องว่างช่องใดก็ได้ที่อยู่ถัดจากตัวที่ถูกกิน</p>
            </div>
          </div>

          {/* Rule 4: การชนะ */}
          <div className="p-4 rounded-2xl bg-[#fcfaf7] border border-[#dccdc0] space-y-1.5">
            <div className="flex items-center gap-2 text-[#2e7d32] font-bold">
              <CheckCircle className="w-5 h-5 text-[#2e7d32]" />
              <span>การตัดสินแพ้-ชนะ</span>
            </div>
            <p className="text-[#5d4432] pl-7">
              ผู้เล่นที่สามารถกินหมากของฝ่ายตรงข้ามจนหมดกระดาน หรือทำให้ฝ่ายตรงข้ามไม่มีตาเดินได้ (ตาตัน)
              จะเป็นฝ่ายชนะทันที!
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-4 border-t border-[#e8ded3] flex justify-end">
          <button
            id="understood-rules-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7a3809] hover:bg-[#662e07] text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            เข้าใจแล้ว เริ่มเล่น
          </button>
        </div>
      </div>
    </div>
  );
};
