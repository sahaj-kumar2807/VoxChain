import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface VotingStepperProps {
  currentStep: number; // 1 to 6
}

export const VotingStepper: React.FC<VotingStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select' },
    { id: 2, label: 'Review' },
    { id: 3, label: 'Sign' },
    { id: 4, label: 'Broadcast' },
    { id: 5, label: 'Mine' },
    { id: 6, label: 'Sealed' },
  ];

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[500px] relative">
        {/* Connecting Background Line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-vox-border-medium z-0" />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200',
                  isCompleted
                    ? 'bg-vox-state-success text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : isActive
                    ? 'bg-vox-accent-gold text-black ring-4 ring-vox-accent-gold/20 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-vox-surface-3 text-vox-text-muted border border-vox-border-medium'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={cn(
                  'text-[11px] font-mono uppercase tracking-wider font-semibold',
                  isActive
                    ? 'text-vox-accent-gold'
                    : isCompleted
                    ? 'text-vox-state-success'
                    : 'text-vox-text-muted'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
