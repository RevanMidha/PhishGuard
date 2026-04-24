import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UrlScanner = lazy(() => import('./pages/UrlScanner'));
const TextScanner = lazy(() => import('./pages/TextScanner'));
const VisionScanner = lazy(() => import('./pages/VisionScanner'));
const Methodology = lazy(() => import('./pages/Methodology'));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-slate-950 text-amber-100">
            Loading workspace...
          </div>
        }
      >
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes using Shared Layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="url-scanner" element={<UrlScanner />} />
            <Route path="text-scanner" element={<TextScanner />} />
            <Route path="vision-scanner" element={<VisionScanner />} />
            <Route path="methodology" element={<Methodology />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;