import React from 'react';
import { motion } from 'framer-motion';

export interface CyberStepCardProps {
  num: string;
  title: string;
  desc: string;
  tag?: string;
  delay?: number;
}

/**
 * Custom SVG renderer for stylized stencil/3D cyber numbers (01-06)
 * matching the site's signature electric blue / violet / indigo aesthetic:
 * Bold block geometry, electric violet & cyan gradient, horizontal stencil cuts, and 3D offset bevels.
 */
export const CyberNumber: React.FC<{ num: string }> = ({ num }) => {
  return (
    <div className="relative inline-flex items-center select-none font-mono">
      <svg
        viewBox="0 0 140 70"
        className="h-16 sm:h-20 w-auto filter drop-shadow-[0_0_14px_rgba(129,140,248,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`blueGrad-${num}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#A5B4FC" />
            <stop offset="75%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* 3D Offset / Bevel shadow behind */}
        <text
          x="3"
          y="56"
          fill="#060814"
          stroke="#1E1B4B"
          strokeWidth="3.5"
          strokeLinejoin="bevel"
          className="font-mono font-black text-5xl tracking-tight"
          style={{ fontFamily: 'Impact, "Chakra Petch", "Arial Black", sans-serif' }}
        >
          {num}
        </text>

        {/* Outer Highlight Stroke */}
        <text
          x="0"
          y="54"
          fill="none"
          stroke="#C7D2FE"
          strokeWidth="2.5"
          strokeLinejoin="bevel"
          className="font-mono font-black text-5xl tracking-tight"
          style={{ fontFamily: 'Impact, "Chakra Petch", "Arial Black", sans-serif' }}
        >
          {num}
        </text>

        {/* Primary Electric Blue / Violet Fill */}
        <text
          x="0"
          y="54"
          fill={`url(#blueGrad-${num})`}
          className="font-mono font-black text-5xl tracking-tight"
          style={{ fontFamily: 'Impact, "Chakra Petch", "Arial Black", sans-serif' }}
        >
          {num}
        </text>

        {/* Horizontal Stencil Cutout Line through the numbers */}
        <line
          x1="-5"
          y1="34"
          x2="130"
          y2="34"
          stroke="#05070E"
          strokeWidth="3.5"
        />
        <line
          x1="-5"
          y1="34"
          x2="130"
          y2="34"
          stroke="#312E81"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};

export const CyberStepCard: React.FC<CyberStepCardProps> = ({
  num,
  title,
  desc,
  tag,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group relative"
    >
      {/* Decorative 3D Wireframe Netting / Geometric Polyhedron in Electric Violet */}
      <div className="absolute -top-7 -right-7 w-28 h-28 pointer-events-none opacity-30 group-hover:opacity-75 transition-all duration-300">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#818CF8]" fill="none" strokeWidth="0.8">
          <polygon points="50,5 95,95 5,95" />
          <line x1="50" y1="5" x2="50" y2="95" />
          <line x1="27" y1="50" x2="73" y2="50" />
          <line x1="16" y1="72" x2="84" y2="72" />
          <line x1="38" y1="28" x2="62" y2="28" />
        </svg>
      </div>

      {/* Outer Chamfered Border Container in Electric Blue / Indigo Gradient */}
      <div
        className="p-[1.5px] bg-gradient-to-br from-[#818CF8]/50 via-[#1E1B4B] to-[#38BDF8]/30 group-hover:from-[#818CF8] group-hover:via-[#6366F1] group-hover:to-[#38BDF8] transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.85)] group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.28)]"
        style={{
          clipPath: 'polygon(32px 0%, 100% 0%, 100% calc(100% - 32px), calc(100% - 32px) 100%, 0% 100%, 0% 32px)',
        }}
      >
        {/* Inner Card Body in Midnight Blue Glassmorphism */}
        <div
          className="relative bg-[#060812]/95 group-hover:bg-[#0B0F1E]/95 backdrop-blur-md p-7 sm:p-9 transition-colors duration-300 min-h-[220px] flex flex-col justify-between"
          style={{
            clipPath: 'polygon(31px 0%, 100% 0%, 100% calc(100% - 31px), calc(100% - 31px) 100%, 0% 100%, 0% 31px)',
          }}
        >
          {/* Subtle Star Dust Particles inside Card */}
          <div className="absolute top-6 right-10 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          <div className="absolute bottom-10 left-10 w-1 h-1 rounded-full bg-[#38BDF8]/70" />
          <div className="absolute top-1/2 right-6 w-0.5 h-0.5 rounded-full bg-[#818CF8]/60" />

          {/* Top Row: Big Electric Blue Stencil Number + Status Tag */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <CyberNumber num={num} />

              {tag && (
                <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded border border-[#818CF8]/40 bg-[#6366F1]/10 text-[#A5B4FC] font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                  {tag}
                </span>
              )}
            </div>

            {/* Title & Human-Friendly Description */}
            <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#F8FAFC] group-hover:text-white mb-2.5 tracking-tight transition-colors">
              {title}
            </h3>

            <p className="font-sans text-sm text-[#94A3B8] group-hover:text-[#CBD5E1] leading-relaxed transition-colors">
              {desc}
            </p>
          </div>

          {/* Bottom Hairline Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
            <span className="group-hover:text-[#818CF8] transition-colors font-semibold">STAGE {num}</span>
            <span className="text-[#475569] group-hover:text-white transition-colors">VERIFIED RECORD</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
