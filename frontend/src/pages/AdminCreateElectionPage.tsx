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
import { PlusCircle, ArrowLeft, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
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

  // Safely parse initial election name, stripping any query string leakage
  const rawName = searchParams.get('name') || '';
  const initialName = rawName.split(/\?|&/)[0].trim();
  const isRunoff = Boolean(initialName.toLowerCase().includes('runoff'));

  const [electionName, setElectionName] = useState(initialName);
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
        <Link
          to={returnUrl}
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>

        <VoxCard
          variant="layer-1"
          padding="lg"
          className={isRunoff ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.06)]' : ''}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {isRunoff ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Scale className="w-3.5 h-3.5" />
                <span>TIE-BREAKER RUNOFF</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/[0.06] text-zinc-300 border border-white/10">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>NEW ELECTION</span>
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2 tracking-tight">
            {isRunoff ? 'Schedule Runoff Election' : 'Create New Election'}
          </h1>
          <p className="text-xs font-mono text-zinc-400 mb-6 leading-relaxed">
            {isRunoff
              ? 'A tie occurred in the certified tally. Create this runoff ballot to determine the definitive winner.'
              : 'Set up an election on-chain. Once created, you can register candidates and authorize voter addresses.'}
          </p>

          {!isAdminLoading && adminAddress && !isUserAdmin && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-semibold text-xs font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Spectator Mode · Admin Account Required</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Only the contract administrator ({adminAddress.slice(0, 6)}...{adminAddress.slice(-4)}) can create elections. Please switch to the designated admin account in your wallet.
              </p>
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
              Election initialized on-chain! Returning to dashboard...
            </VoxAlert>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-6">
            <div>
              <VoxInput
                label="Election Title"
                placeholder="e.g. Annual Community Leadership Election (Runoff)"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
                disabled={isDeploying || success || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                hint={
                  isRunoff
                    ? 'Review or adjust the runoff title before broadcasting.'
                    : 'Enter the official title for this election.'
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Link to={returnUrl}>
                <VoxButton variant="outline" type="button" disabled={isDeploying || success}>
                  Cancel
                </VoxButton>
              </Link>
              <VoxButton
                variant="primary"
                type="submit"
                isLoading={isDeploying}
                loadingText="Deploying..."
                disabled={!electionName.trim() || success || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                className={isRunoff ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-400 font-bold' : ''}
              >
                {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                  ? 'Admin Wallet Required'
                  : isRunoff
                  ? 'Launch Runoff Ballot →'
                  : 'Create Election →'}
              </VoxButton>
            </div>
          </form>
        </VoxCard>
      </div>
    </AdminGuard>
  );
};
