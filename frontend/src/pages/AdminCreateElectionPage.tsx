import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxAlert } from '../components/common/VoxAlert';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const AdminCreateElectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { contractAddress, writeContractAsync, refetchCount } = useVoxChain();
  const [electionName, setElectionName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionName.trim()) {
      setError('Election name cannot be empty');
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'createElection',
        args: [electionName.trim()],
      });

      setSuccess(true);
      refetchCount();
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err: any) {
      setIsDeploying(false);
      setError(err?.shortMessage || err?.message || 'Transaction failed or was rejected');
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto py-8 flex flex-col gap-6">
        <Link to="/admin" className="flex items-center gap-1.5 text-xs font-mono text-vox-text-muted hover:text-vox-accent-gold">
          <ArrowLeft className="w-4 h-4" /> Back to Governance Command
        </Link>

        <VoxCard variant="layer-1" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="w-5 h-5 text-vox-accent-gold" />
            <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider">
              Smart Contract Deployment
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-vox-text-primary mb-2">
            Initialize New Election Ballot
          </h1>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            This action creates a new election slot in smart contract storage via <code>createElection(name)</code>.
            Once initialized, you can add candidates and register eligible voter wallet addresses.
          </p>

          {error && (
            <VoxAlert variant="danger" title="Deployment Failed" className="mb-4">
              {error}
            </VoxAlert>
          )}

          {success && (
            <VoxAlert variant="success" title="Election Initialized on Chain" className="mb-4">
              Smart contract event <code>ElectionCreated</code> emitted! Redirecting to governance dashboard...
            </VoxAlert>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <VoxInput
              label="Election Official Title"
              placeholder="e.g. 2026 Foundation Board of Governors"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              disabled={isDeploying || success}
              hint="Must be non-empty. This title is committed permanently to EVM storage."
            />

            {/* Live Ballot Card Preview */}
            {electionName && (
              <div className="p-4 bg-vox-surface-2 rounded-xl border border-vox-border-subtle">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vox-text-muted block mb-1">
                  Voter Preview:
                </span>
                <h4 className="font-display font-bold text-base text-vox-text-primary">{electionName}</h4>
                <span className="text-xs font-mono text-vox-accent-gold">Status: Upcoming Draft</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-vox-border-subtle">
              <Link to="/admin">
                <VoxButton variant="outline" type="button" disabled={isDeploying || success}>
                  Cancel
                </VoxButton>
              </Link>
              <VoxButton
                variant="primary-gold"
                type="submit"
                isLoading={isDeploying}
                loadingText="Broadcasting Tx..."
                disabled={!electionName.trim() || success}
              >
                Deploy Election to Blockchain →
              </VoxButton>
            </div>
          </form>
        </VoxCard>
      </div>
    </AdminGuard>
  );
};
