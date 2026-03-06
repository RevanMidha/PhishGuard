import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology'; // ADDED THIS IMPORT

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
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* ADDED THIS NEW ROUTE */}
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