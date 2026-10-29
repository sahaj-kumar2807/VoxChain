import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeaderNav } from './components/layout/HeaderNav';
import { FooterColophon } from './components/layout/FooterColophon';
import { LandingPage } from './pages/LandingPage';
import { VoterDashboard } from './pages/VoterDashboard';
import { ElectionDetailsPage } from './pages/ElectionDetailsPage';
import { VoteProcessPage } from './pages/VoteProcessPage';
import { ResultsPage } from './pages/ResultsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCreateElectionPage } from './pages/AdminCreateElectionPage';
import { AdminCandidatesPage } from './pages/AdminCandidatesPage';
import { AdminVotersPage } from './pages/AdminVotersPage';
import { AdminControlPage } from './pages/AdminControlPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { RequestAdminPage } from './pages/RequestAdminPage';
import { RequestVoterPage } from './pages/RequestVoterPage';
import { ApproveVotersPage } from './pages/ApproveVotersPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.997,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#000000] text-[#FFFFFF] overflow-x-hidden relative selection:bg-[#6366F1] selection:text-white">
      <ScrollToTop />
      
      {/* ── Global High-Contrast Deep Space Atmosphere for Internal Pages ── */}
      {!isLanding && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 print:hidden">
          {/* Top subtle electric indigo radiant glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.14)_0%,rgba(79,70,229,0.03)_45%,transparent_72%)] blur-3xl" />
          {/* Subtle neon cyan accent glow on right */}
          <div className="absolute top-1/4 right-[4%] w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_65%)] blur-3xl" />
          <div className="absolute top-1/3 left-[4%] w-[420px] h-[420px] bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_65%)] blur-3xl" />
          {/* Crisp subtle coordinate grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>
      )}

      <div className="relative z-10 print:z-auto">
        {!isLanding && (
          <div className="print:hidden">
            <HeaderNav />
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {isLanding ? (
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
              </Routes>
            ) : (
              <main className="max-w-6xl mx-auto px-4 w-full py-6 print:p-0 print:m-0 print:max-w-none">
                <Routes location={location} key={location.pathname}>
                  <Route path="/dashboard" element={<VoterDashboard />} />
                  <Route path="/election/:id" element={<ElectionDetailsPage />} />
                  <Route path="/election/:id/vote" element={<VoteProcessPage />} />
                  <Route path="/election/:id/results" element={<ResultsPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/create-election" element={<AdminCreateElectionPage />} />
                  <Route path="/admin/election/:id/candidates" element={<AdminCandidatesPage />} />
                  <Route path="/admin/election/:id/voters" element={<AdminVotersPage />} />
                  <Route path="/admin/election/:id/control" element={<AdminControlPage />} />

                  {/* Super Admin Route */}
                  <Route path="/super-admin" element={<SuperAdminPage />} />

                  {/* Voter Verification & Approval Routes */}
                  <Route path="/approve-voters" element={<ApproveVotersPage />} />
                  <Route path="/request-voter" element={<RequestVoterPage />} />
                  <Route path="/become-voter" element={<RequestVoterPage />} />

                  {/* Public Organisation Onboarding Routes */}
                  <Route path="/request-admin" element={<RequestAdminPage />} />
                  <Route path="/become-admin" element={<RequestAdminPage />} />
                </Routes>
              </main>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {!isLanding && (
        <div className="print:hidden">
          <FooterColophon />
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
