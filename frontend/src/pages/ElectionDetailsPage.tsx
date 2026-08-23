import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VoxCard } from '../components/common/VoxCard';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxButton } from '../components/common/VoxButton';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { VoxAlert } from '../components/common/VoxAlert';
import { ShieldCheck, Vote, Trophy, Lock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, User } from 'lucide-react';

export const ElectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { contractAddress } = useVoxChain();
  const { election, candidates, isEligible, hasVoted, isLoading } = useElection(electionId);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-accent-gold border-t-transparent animate-spin mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Fetching On-Chain Election #{id}...</span>
      </div>
    );
  }

  const isStarted = election.started && !election.ended;
  const isEnded = election.ended;
  const isPending = !election.started && !election.ended;

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-vox-text-muted">
        <Link to="/dashboard" className="hover:text-vox-accent-gold flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Elections Hub
        </Link>
        <span>/</span>
        <span className="text-vox-text-secondary">Election #{electionId}</span>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-vox-surface-1 border border-vox-border-medium rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-vox-surface-3 text-vox-accent-gold border border-vox-border-subtle">
              BALLOT #{electionId.toString().padStart(2, '0')}
            </span>
            {isStarted && <VoxBadge variant="success" dot={true}>Voting Open</VoxBadge>}
            {isEnded && <VoxBadge variant="gold">Concluded</VoxBadge>}
            {isPending && <VoxBadge variant="neutral">Upcoming</VoxBadge>}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-vox-text-primary mb-2">
            {election.name}
          </h1>
          <p className="text-xs font-mono text-vox-text-muted">
            Smart Contract: <VoxHashPill hash={contractAddress} type="address" />
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          {isEnded ? (
            <Link to={`/election/${electionId}/results`}>
              <VoxButton variant="primary-gold" icon={<Trophy className="w-4 h-4" />}>
                View Certified Results
              </VoxButton>
            </Link>
          ) : hasVoted ? (
            <div className="p-3 bg-vox-state-success-bg border border-vox-state-success/30 rounded-xl flex items-center gap-2 text-xs font-semibold text-vox-state-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>You Have Voted</span>
            </div>
          ) : isStarted ? (
            <Link to={`/election/${electionId}/vote`}>
              <VoxButton variant="primary-gold" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                {isEligible ? 'Proceed to Ballot →' : 'View Candidate Roster'}
              </VoxButton>
            </Link>
          ) : (
            <VoxBadge variant="neutral" size="md">
              Election Not Yet Started
            </VoxBadge>
          )}
        </div>
      </div>

      {/* Grid: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Candidate Roster */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-xl text-vox-text-primary">
              Registered Candidate Roster ({candidates.length})
            </h3>
            <span className="font-mono text-xs text-vox-text-muted">Verified on EVM</span>
          </div>

          <div className="flex flex-col gap-4">
            {candidates.length === 0 ? (
              <VoxCard variant="layer-1" padding="lg" className="text-center text-xs text-vox-text-muted">
                No candidates registered on this ballot yet.
              </VoxCard>
            ) : (
              candidates.map((cand) => (
                <VoxCard key={cand.id.toString()} variant="layer-2" padding="md" className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-vox-surface-3 border border-vox-border-medium flex items-center justify-center text-vox-accent-gold shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-display font-bold text-base text-vox-text-primary">{cand.name}</h4>
                      <span className="font-mono text-xs text-vox-text-muted">Candidate #{cand.id.toString()}</span>
                    </div>
                    <p className="text-xs text-vox-text-secondary leading-relaxed">
                      Official candidate registered by election authority under smart contract parameter{' '}
                      <code>addCandidate({electionId}, "{cand.name}")</code>.
                    </p>
                  </div>
                </VoxCard>
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Eligibility & Smart Contract Checklist */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <VoxCard variant="layer-1" padding="lg" className="flex flex-col gap-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-vox-accent-gold">
              Voter Eligibility Audit
            </h3>

            {isConnected && address ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
                  <span className="text-vox-text-secondary">Your Address:</span>
                  <VoxHashPill hash={address} type="address" />
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
                  <span className="text-vox-text-secondary">Registered on Ballot:</span>
                  {isEligible ? (
                    <span className="text-vox-state-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <span className="text-vox-state-warning font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Unregistered
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
                  <span className="text-vox-text-secondary">Ballot Cast Status:</span>
                  {hasVoted ? (
                    <span className="text-vox-state-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Voted
                    </span>
                  ) : (
                    <span className="text-vox-text-muted font-mono">Not Voted Yet</span>
                  )}
                </div>
              </div>
            ) : (
              <VoxAlert variant="info" title="Wallet Not Connected">
                Connect your Ethereum wallet to verify whether your address is registered on this ballot allowlist.
              </VoxAlert>
            )}

            {/* Smart Contract Flags */}
            <div className="pt-4 border-t border-vox-border-subtle flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-vox-text-muted">election.started:</span>
                <span className={election.started ? 'text-vox-state-success' : 'text-vox-text-muted'}>
                  {election.started ? 'true' : 'false'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-vox-text-muted">election.ended:</span>
                <span className={election.ended ? 'text-vox-accent-gold' : 'text-vox-text-muted'}>
                  {election.ended ? 'true' : 'false'}
                </span>
              </div>
            </div>
          </VoxCard>
        </div>
      </div>
    </div>
  );
};
