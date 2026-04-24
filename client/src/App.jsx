import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UrlScanner from './pages/UrlScanner';
import TextScanner from './pages/TextScanner';
import VisionScanner from './pages/VisionScanner';
import Methodology from './pages/Methodology';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;