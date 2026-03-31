import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UrlScanner from './pages/UrlScanner';
import TextScanner from './pages/TextScanner';
import VisionScanner from './pages/VisionScanner';
import Methodology from './pages/Methodology';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/url-scanner" 
          element={
            <ProtectedRoute>
              <UrlScanner />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/text-scanner" 
          element={
            <ProtectedRoute>
              <TextScanner />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vision-scanner" 
          element={
            <ProtectedRoute>
              <VisionScanner />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/methodology" 
          element={
            <ProtectedRoute>
              <Methodology />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;