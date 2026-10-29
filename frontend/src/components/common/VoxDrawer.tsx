import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface VoxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const VoxDrawer: React.FC<VoxDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 z-[10000]">
            {/* Drawer Surface */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'w-screen h-full max-h-screen bg-[#0A0A10] border-l border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col',
                widthClasses[width]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-[#08080E] shrink-0">
                <div>
                  {title && <h2 className="font-display font-bold text-xl text-white">{title}</h2>}
                  {subtitle && <p className="text-xs text-zinc-400 mt-1 font-mono">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">{children}</div>

              {/* Sticky Footer */}
              {footer && (
                <div className="p-5 sm:p-6 border-t border-white/10 bg-[#08080E] shrink-0 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
