import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { ArrowLeft, UserCheck, Search, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { isAddress } from 'viem';
import { useReadContract, usePublicClient, useAccount, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { isSupportedChain } from '../contracts/config';
import { parseContractError } from '../hooks/useVoxChainRegistry';

export const AdminVotersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const contractParam = (searchParams.get('contract') as `0x${string}`) || undefined;
  const electionId = Number(id);
  const publicClient = usePublicClient();
  const { address: userAddress, chainId: accountChainId } = useAccount();
  const defaultChainId = useChainId();
  const chainId = isSupportedChain(accountChainId) ? accountChainId : (isSupportedChain(defaultChainId) ? defaultChainId : sepolia.id);
  const {
    contractAddress,
    writeContractAsync,
    adminAddress,
    isUserAdmin,
    isAdminLoading,
  } = useVoxChain(contractParam);
  const { election, isLoading, refetchAll } = useElection(electionId, contractParam);

  const [voterAddress, setVoterAddress] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Address Eligibility Tester
  const [testAddress, setTestAddress] = useState('');
  const isValidTestAddress = isAddress(testAddress);

  const { data: testEligibilityResult, isFetching: isTesting } = useReadContract({
    address: contractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkEligibility',
    args: isValidTestAddress ? [BigInt(electionId), testAddress as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: isValidTestAddress && Boolean(contractAddress),
      staleTime: 5_000,
    },
  });

  const { data: testHasVotedResult } = useReadContract({
    address: contractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkHasVoted',
    args: isValidTestAddress ? [BigInt(electionId), testAddress as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: isValidTestAddress && Boolean(contractAddress),
      staleTime: 5_000,
    },
  });

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Election #{id}...</span>
      </div>
    );
  }

  const isLocked = election.started || election.ended;

  const handleRegisterVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(voterAddress.trim()) || isRegistering || isLocked) {
      if (!isAddress(voterAddress.trim())) {
        setRegisterError('Invalid Ethereum address format (must begin with 0x and be 42 characters).');
      }
      return;
    }

    if (!isUserAdmin && adminAddress) {
      setRegisterError(
        `Only the designated administrator (${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}) can register voters on this contract.`
      );
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      if (!contractAddress) {
        throw new Error('Election smart contract is not configured on this network.');
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'registerVoter',
        args: [BigInt(electionId), voterAddress.trim() as `0x${string}`],
      });

      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setRegisterSuccess(`Voter ${voterAddress.slice(0, 8)}... successfully registered on-chain!`);
      setVoterAddress('');
      setIsRegistering(false);
      await refetchAll();
    } catch (err: any) {
      setIsRegistering(false);
      setRegisterError(parseContractError(err));
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto py-8 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to={contractParam ? `/admin?contract=${contractParam}` : '/admin'}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Election #{electionId}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-300 font-medium">{election.name}</span>
          </div>
        </div>

        {/* Master Header Card */}
        <VoxCard variant="layer-1" padding="lg" className="border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Voter Registration
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                Voter List & Eligibility
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-500">
                <span>ELECTION ID: #{electionId}</span>
                <span className="text-zinc-700">·</span>
                <span>CRYPTOGRAPHIC WHITELISTING</span>
              </div>
            </div>
            <div className="shrink-0">
              {election.started && <VoxBadge variant="success" dot={true}>Voting Window Open (Locked)</VoxBadge>}
              {election.ended && <VoxBadge variant="neutral">Election Ended (Locked)</VoxBadge>}
              {!election.started && !election.ended && (
                <VoxBadge variant="neutral">Registration Open</VoxBadge>
              )}
            </div>
          </div>
        </VoxCard>

        {/* Lock Warning if Started */}
        {isLocked && (
          <VoxAlert variant="warning" title="Voter Registration Closed">
            This election is currently active or concluded. Voter registration closes permanently once an election starts to ensure fairness.
          </VoxAlert>
        )}

        {/* Grid: Register Form + Live Address Tester */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Register Form (6 cols) */}
          <div className="md:col-span-6">
            <VoxCard variant="layer-1" padding="lg">
              <h3 className="font-display font-bold text-lg text-vox-text-primary mb-2">
                Register Voter Address
              </h3>
              <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
                Add an authorized wallet address so this voter can participate in this election.
              </p>

              {!isAdminLoading && adminAddress && !isUserAdmin && (
                <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-zinc-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Admin Account Required</span>
                  </div>
                  <p className="leading-relaxed">
                    Only the designated administrator can authorize voters for this election. Please switch to the administrator account in your wallet.
                  </p>
                </div>
              )}

              {registerError && <VoxAlert variant="danger" title="Registration Failed" className="mb-3">{registerError}</VoxAlert>}
              {registerSuccess && <VoxAlert variant="success" title="Success" className="mb-3">{registerSuccess}</VoxAlert>}

              <form onSubmit={handleRegisterVoter} className="flex flex-col gap-4">
                <VoxInput
                  label="Voter Wallet Address"
                  placeholder="0x..."
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  disabled={isRegistering || isLocked || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                  hint="Enter a valid Ethereum wallet address."
                />

                <VoxButton
                  variant="primary"
                  type="submit"
                  isLoading={isRegistering}
                  loadingText="Registering..."
                  disabled={!voterAddress || isLocked || (!isAdminLoading && !isUserAdmin && Boolean(adminAddress))}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  {!isAdminLoading && !isUserAdmin && Boolean(adminAddress)
                    ? 'Admin Wallet Required'
                    : 'Authorize Voter'}
                </VoxButton>
              </form>
            </VoxCard>
          </div>

          {/* Real-time Address Tester (6 cols) */}
          <div className="md:col-span-6">
            <VoxCard variant="layer-2" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-[#D8D8D8]" />
                <h3 className="font-display font-bold text-lg text-vox-text-primary">
                  Check Voter Status
                </h3>
              </div>
              <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
                Quickly check whether an address is allowed to vote and whether they have already cast their ballot.
              </p>

              <VoxInput
                label="Check Any Address"
                placeholder="Paste 0x... address to test"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
              />

              {isValidTestAddress && (
                <div className="mt-4 p-4 bg-vox-surface-1 rounded-xl border border-vox-border-subtle flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-vox-border-subtle">
                    <span className="text-vox-text-muted">Registered Eligible:</span>
                    {isTesting ? (
                      <span className="text-vox-text-muted">Querying...</span>
                    ) : testEligibilityResult ? (
                      <span className="text-vox-state-success font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> YES (Eligible)
                      </span>
                    ) : (
                      <span className="text-vox-state-danger font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> NO (Unregistered)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-vox-text-muted">Ballot Cast Status:</span>
                    {testHasVotedResult ? (
                      <span className="text-[#FFFFFF] font-bold">VOTE COMMITTED</span>
                    ) : (
                      <span className="text-vox-text-muted">NOT VOTED</span>
                    )}
                  </div>
                </div>
              )}
            </VoxCard>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};
