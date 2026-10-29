import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { usePublicClient, useAccount } from 'wagmi';
import { useVoxChain } from '../hooks/useVoxChain';
import { useVoxChainRegistry } from '../hooks/useVoxChainRegistry';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxAlert } from '../components/common/VoxAlert';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { parseContractError } from '../hooks/useVoxChainRegistry';

export const AdminCreateElectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { isSuperAdmin } = useVoxChainRegistry();
  const {
    contractAddress,
    writeContractAsync,
    refetchCount,
    adminAddress,
    isUserAdmin,
    isAdminLoading,
    orgName,
  } = useVoxChain(contractParam);
  const [electionName, setElectionName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionName.trim() || isDeploying) {
      if (!electionName.trim()) {
        setError('Election name cannot be empty');
      }
      return;
    }

    if (!isUserAdmin && adminAddress) {
      setError(
        `Only the designated administrator (${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}) can create elections on this contract. Please switch accounts in MetaMask.`
      );
      return;
    }

    setIsDeploying(true);
    setError(null);
    setStatusMessage('Awaiting wallet approval in MetaMask...');

    try {
      if (!contractAddress) {
        throw new Error('Election smart contract is not configured on this network.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'createElection',
        args: [electionName.trim()],
      });

      setStatusMessage('Broadcasting transaction & awaiting block confirmation...');
      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      const returnUrl = contractParam ? `/admin?contract=${contractParam}` : '/admin';
      setSuccess(true);
      setStatusMessage(null);
      await refetchCount();
      setTimeout(() => {
        navigate(returnUrl);
      }, 1500);
    } catch (err: any) {
      setIsDeploying(false);
      setStatusMessage(null);
      setError(parseContractError(err));
    }
  };

  const returnUrl = contractParam ? `/admin?contract=${contractParam}` : '/admin';

  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto py-8 flex flex-col gap-6">
        <Link to={returnUrl} className="flex items-center gap-1.5 text-xs font-mono text-vox-text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>

        <VoxCard variant="layer-1" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="w-5 h-5 text-[#D8D8D8]" />
            <span className="font-mono text-xs font-semibold text-[#D8D8D8] uppercase tracking-wider">
              New Election
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-vox-text-primary mb-2">
            Create New Election
          </h1>
          <p className="text-xs text-vox-text-secondary mb-6 leading-relaxed">
            Set up an election. Once created, you can add candidates and invite authorized voters.
          </p>

          {!isAdminLoading && adminAddress && !isUserAdmin && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Administrator Account Required</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                You are currently viewing this election workspace in spectator mode. Only the designated administrator can create new elections.
              </p>
              <div className="pt-2.5 border-t border-amber-500/20 text-xs text-zinc-300 space-y-1">
                <div className="font-semibold text-white">How to proceed:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Switch to the administrator account in your wallet.
                  </li>
                  {isSuperAdmin && (
                    <li>
                      Or visit the{' '}
                      <Link to="/super-admin" className="underline text-indigo-400 hover:text-indigo-300">
                        Super Admin portal
                      </Link>{' '}
                      to assign yourself as administrator for this organisation.
                    </li>
                  )}
                  <li>
                    Or return to the{' '}
                    <Link to="/admin" className="underline text-indigo-400 hover:text-indigo-300">
                      Admin Dashboard
                    </Link>{' '}
                    and choose your primary platform workspace.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <VoxAlert variant="danger" title="Creation Failed" className="mb-4">
              {error}
            </VoxAlert>
          )}

          {statusMessage && (
            <VoxAlert variant="info" title="Processing" className="mb-4">
              {statusMessage}
            </VoxAlert>
          )}

          {success && (
            <VoxAlert variant="success" title="Election Created Successfully" className="mb-4">
              Election created! Redirecting to dashboard...
            </VoxAlert>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <VoxInput
              label="Election Title"
              placeholder="e.g. 2026 Student Council Election"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              disabled={isDeploying || success || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
              hint="Enter the official title for this election."
            />

            {/* Live Ballot Card Preview */}
            {electionName && (
              <div className="p-4 bg-vox-surface-2 rounded-xl border border-vox-border-subtle">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vox-text-muted block mb-1">
                  Preview:
                </span>
                <h4 className="font-display font-bold text-base text-vox-text-primary">{electionName}</h4>
                <span className="text-xs font-mono text-[#D8D8D8]">Status: Draft</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-vox-border-subtle">
              <Link to={returnUrl}>
                <VoxButton variant="outline" type="button" disabled={isDeploying || success}>
                  Cancel
                </VoxButton>
              </Link>
              <VoxButton
                variant="primary"
                type="submit"
                isLoading={isDeploying}
                loadingText="Creating election..."
                disabled={!electionName.trim() || success || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
              >
                {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                  ? 'Admin Wallet Required'
                  : 'Create Election →'}
              </VoxButton>
            </div>
          </form>
        </VoxCard>
      </div>
    </AdminGuard>
  );
};
