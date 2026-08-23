import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-vox-bg-base text-vox-text-primary">
        <div>
          <HeaderNav />
          <main className="max-w-6xl mx-auto px-4 w-full">
            <Routes>
              {/* Voter Routes */}
              <Route path="/" element={<LandingPage />} />
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
            </Routes>
          </main>
        </div>
        <FooterColophon />
      </div>
    </BrowserRouter>
  );
};

export default App;
