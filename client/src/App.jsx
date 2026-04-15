import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UrlScanner = lazy(() => import('./pages/UrlScanner'));
const TextScanner = lazy(() => import('./pages/TextScanner'));
const VisionScanner = lazy(() => import('./pages/VisionScanner'));
const Methodology = lazy(() => import('./pages/Methodology'));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-400">
    <Loader2 className="animate-spin w-10 h-10" />
  </div>
);

const ContentLoader = () => (
  <div className="flex h-full w-full items-center justify-center text-slate-400 p-8">
    <Loader2 className="animate-spin w-10 h-10" />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/" 
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          } 
        />
        
        {/* Protected Routes using Shared Layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Suspense fallback={<ContentLoader />}><Dashboard /></Suspense>} />
          <Route path="url-scanner" element={<Suspense fallback={<ContentLoader />}><UrlScanner /></Suspense>} />
          <Route path="text-scanner" element={<Suspense fallback={<ContentLoader />}><TextScanner /></Suspense>} />
          <Route path="vision-scanner" element={<Suspense fallback={<ContentLoader />}><VisionScanner /></Suspense>} />
          <Route path="methodology" element={<Suspense fallback={<ContentLoader />}><Methodology /></Suspense>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;