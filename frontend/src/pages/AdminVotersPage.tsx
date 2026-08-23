import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useElection } from '../hooks/useElection';
import { useVoxChain } from '../hooks/useVoxChain';
import { VOX_CHAIN_ABI } from '../contracts/voxChainAbi';
import { AdminGuard } from '../components/admin/AdminGuard';
import { VoxCard } from '../components/common/VoxCard';
import { VoxInput } from '../components/common/VoxInput';
import { VoxButton } from '../components/common/VoxButton';
import { VoxBadge } from '../components/common/VoxBadge';
import { VoxAlert } from '../components/common/VoxAlert';
import { VoxHashPill } from '../components/common/VoxHashPill';
import { ArrowLeft, UserCheck, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { isAddress } from 'viem';
import { useReadContract } from 'wagmi';

export const AdminVotersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const electionId = Number(id);
  const { contractAddress, writeContractAsync } = useVoxChain();
  const { election, isLoading, refetchAll } = useElection(electionId);

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
    query: {
      enabled: isValidTestAddress,
    },
  });

  const { data: testHasVotedResult } = useReadContract({
    address: contractAddress,
    abi: VOX_CHAIN_ABI,
    functionName: 'checkHasVoted',
    args: isValidTestAddress ? [BigInt(electionId), testAddress as `0x${string}`] : undefined,
    query: {
      enabled: isValidTestAddress,
    },
  });

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vox-accent-gold mb-4" />
        <span className="font-mono text-xs text-vox-text-muted">Loading Election #{id}...</span>
      </div>
    );
  }

  const isLocked = election.started || election.ended;

  const handleRegisterVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(voterAddress.trim())) {
      setRegisterError('Invalid Ethereum address format (must begin with 0x and be 42 characters).');
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: VOX_CHAIN_ABI,
        functionName: 'registerVoter',
        args: [BigInt(electionId), voterAddress.trim() as `0x${string}`],
      });

      setRegisterSuccess(`Voter ${voterAddress.slice(0, 8)}... successfully registered on-chain!`);
      setVoterAddress('');
      setIsRegistering(false);
      refetchAll();
    } catch (err: any) {
      setIsRegistering(false);
      setRegisterError(err?.shortMessage || err?.message || 'Transaction failed or voter is already registered');
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between border-b border-vox-border-subtle pb-4">
          <Link to="/admin" className="flex items-center gap-1.5 text-xs font-mono text-vox-text-muted hover:text-vox-accent-gold">
            <ArrowLeft className="w-4 h-4" /> Governance Command
          </Link>
          <span className="font-mono text-xs text-vox-text-secondary">
            Election: {election.name} (#{electionId})
          </span>
        </div>

        {/* Header */}
        <div className="p-6 bg-vox-surface-1 border border-vox-border-medium rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-vox-accent-gold" />
              <span className="font-mono text-xs font-semibold text-vox-accent-gold uppercase tracking-wider">
                Voter Allowlist Station
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-vox-text-primary">
              Voter Allowlist & Eligibility
            </h1>
          </div>
          <div>
            {election.started && <VoxBadge variant="success" dot={true}>Election Started (Locked)</VoxBadge>}
            {election.ended && <VoxBadge variant="gold">Election Ended (Locked)</VoxBadge>}
            {!election.started && !election.ended && (
              <VoxBadge variant="neutral">Registration Open</VoxBadge>
            )}
          </div>
        </div>

        {/* Lock Warning if Started */}
        {isLocked && (
          <VoxAlert variant="warning" title="Voter Allowlist Locked">
            This election is currently active or concluded. By smart contract design, voter registration is
            permanently closed once an election starts.
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
                Calls <code>registerVoter({electionId}, address)</code> to grant voting eligibility on the smart contract.
              </p>

              {registerError && <VoxAlert variant="danger" title="Registration Failed" className="mb-3">{registerError}</VoxAlert>}
              {registerSuccess && <VoxAlert variant="success" title="Success" className="mb-3">{registerSuccess}</VoxAlert>}

              <form onSubmit={handleRegisterVoter} className="flex flex-col gap-4">
                <VoxInput
                  label="Voter Ethereum Public Address"
                  placeholder="0x..."
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  disabled={isRegistering || isLocked}
                  hint="Must be a valid 42-character hex address."
                />

                <VoxButton
                  variant="primary-gold"
                  type="submit"
                  isLoading={isRegistering}
                  loadingText="Broadcasting..."
                  disabled={!voterAddress || isLocked}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  Authorize Voter on Blockchain
                </VoxButton>
              </form>
            </VoxCard>
          </div>

          {/* Real-time Address Tester (6 cols) */}
          <div className="md:col-span-6">
            <VoxCard variant="layer-2" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-vox-accent-gold" />
                <h3 className="font-display font-bold text-lg text-vox-text-primary">
                  Live Eligibility Scanner
                </h3>
              </div>
              <p className="text-xs text-vox-text-secondary mb-4 leading-relaxed">
                Queries <code>checkEligibility()</code> and <code>checkHasVoted()</code> directly against smart contract storage slots.
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
                      <span className="text-vox-accent-gold font-bold">VOTE COMMITTED</span>
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
