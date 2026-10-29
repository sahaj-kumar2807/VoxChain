import React, { useState } from 'react';
import { CheckCircle2, Lock, Activity } from 'lucide-react';

interface SimulatedCandidate {
  id: number;
  name: string;
  role: string;
  votes: number;
  percentage: number;
}

/**
 * DemonstrationArtifact — Interactive preview of the election voting experience.
 */
export const DemonstrationArtifact: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'voting' | 'results'>('results');
  const [hasVotedSimulated, setHasVotedSimulated] = useState(false);

  const candidates: SimulatedCandidate[] = [
    { id: 0, name: 'Elena Rostova', role: 'Candidate for President', votes: 142, percentage: 54.2 },
    { id: 1, name: 'Marcus Vance', role: 'Candidate for Treasurer', votes: 89, percentage: 34.0 },
    { id: 2, name: 'Sarah Al-Mansoor', role: 'Candidate for Secretary', votes: 31, percentage: 11.8 },
  ];

  const totalVotes = candidates.reduce((acc, c) => acc + c.votes, 0);

  return (
    <div className="w-full border border-[#292D33] bg-[#0B0D12] rounded-xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
      {/* Banner */}
      <div className="bg-[#121316] border-b border-[#292D33] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse shadow-[0_0_8px_rgba(212,255,0,0.8)]" />
          <span className="text-[#E3E2E5] uppercase font-semibold tracking-wider">
            Interactive Ballot Demo
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#9B9DA2]">
          <span className="hidden sm:inline">Try it out:</span>
          <div className="flex rounded border border-[#292D33] bg-[#07080A] p-0.5">
            {(['voting', 'results'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  viewMode === mode
                    ? 'bg-[#D4FF00] text-[#07080A] font-bold shadow-[0_0_8px_rgba(212,255,0,0.3)]'
                    : 'text-[#9B9DA2] hover:text-[#E3E2E5]'
                }`}
              >
                {mode === 'voting' ? 'Vote View' : 'Results View'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 flex flex-col gap-8">
        {/* Election header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1C212B]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#9B9DA2] mb-2">
              <span className="text-[#D4FF00] font-semibold">SAMPLE ELECTION</span>
              <span className="text-[#292D33]">•</span>
              <span className="text-[#C2C6D4]">Status: {viewMode === 'voting' ? 'Voting Open' : 'Voting Concluded'}</span>
            </div>
            <h3 className="font-display font-medium text-2xl sm:text-3xl text-[#E3E2E5]">
              Annual Community Leadership Election
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#9B9DA2] mt-1 max-w-2xl leading-relaxed">
              Vote for your community council representatives. All ballots are recorded transparently.
            </p>
          </div>
          <div className="flex md:flex-col items-end gap-2 text-right shrink-0">
            <div className="px-3 py-1.5 rounded bg-[#121316] border border-[#292D33] text-[10px] font-mono text-[#E3E2E5] flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#D4FF00]" />
              <span>{totalVotes} Ballots Cast</span>
            </div>
            <span className="text-[9px] font-mono text-[#768297]">Audit: 100% Verified</span>
          </div>
        </div>

        {/* Candidates */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#9B9DA2] uppercase tracking-wider">
            <span>Candidates</span>
            <span>{viewMode === 'voting' ? 'Tap to select' : 'Vote Share'}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {candidates.map((cand) => {
              const isSelected = selectedCandidate === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand.id)}
                  className={`p-4 sm:p-5 rounded-lg border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-[#D4FF00]/50 bg-[#12161F] shadow-[0_0_20px_rgba(212,255,0,0.06)]'
                      : 'border-[#1C212B] bg-[#07080A] hover:bg-[#121316] hover:border-[#292D33]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedCandidate(cand.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono transition-colors shrink-0 ${
                        isSelected ? 'border-[#D4FF00] bg-[#D4FF00] text-[#07080A] font-bold shadow-[0_0_8px_rgba(212,255,0,0.6)]' : 'border-[#292D33] text-[#768297]'
                      }`}>
                        {isSelected ? '✓' : cand.id + 1}
                      </div>
                      <div>
                        <div className="font-sans font-semibold text-sm text-[#E3E2E5]">{cand.name}</div>
                        <div className="font-sans text-xs text-[#9B9DA2]">{cand.role}</div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-right">
                      <span className="font-mono text-sm font-bold text-[#E3E2E5]">{cand.votes} votes</span>
                      <span className="font-mono text-xs text-[#9B9DA2]">{cand.percentage}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#121316] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${isSelected ? 'bg-[#D4FF00]' : 'bg-[#C2C6D4]/30'}`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action / receipt bar */}
        {viewMode === 'voting' ? (
          <div className="p-4 rounded-lg border border-[#292D33] bg-[#121316] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-sans text-[#9B9DA2]">
              <Lock className="w-4 h-4 text-[#D4FF00] shrink-0" />
              <span>Selected: <strong className="text-[#E3E2E5]">{candidates[selectedCandidate]?.name}</strong>. In live elections, voting uses your secure wallet.</span>
            </div>
            <button
              onClick={() => setHasVotedSimulated(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#D4FF00] hover:bg-[#b0d500] text-[#07080A] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(212,255,0,0.2)] shrink-0 cursor-pointer"
            >
              {hasVotedSimulated ? '✓ Vote Simulated' : 'Test Cast Vote'}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-[#1C212B] bg-[#07080A] font-mono text-xs text-[#9B9DA2] flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-[#1C212B] pb-2">
              <span className="text-[10px] uppercase text-[#768297] tracking-wider">Proof of Record • Blockchain Receipt</span>
              <span className="text-[#E3E2E5] flex items-center gap-1.5 font-semibold text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" /> VERIFIED
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[10px]">
              <div>
                <span className="text-[#768297] block">Network:</span>
                <span className="text-[#E3E2E5] block">Ethereum Sepolia</span>
              </div>
              <div>
                <span className="text-[#768297] block">Tally Accuracy:</span>
                <span className="text-[#D4FF00] block">100% Mathematical Proof</span>
              </div>
              <div>
                <span className="text-[#768297] block">Security:</span>
                <span className="text-[#C2C6D4] block">Permanent & Unalterable</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
