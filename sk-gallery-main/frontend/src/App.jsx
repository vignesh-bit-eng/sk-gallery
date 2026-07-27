import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import UploadArt from './pages/UploadArt';
import OwnerLogin from './pages/OwnerLogin';
import ExpertOwnerSearch from './pages/ExpertOwnerSearch';
import ProtectedRoute from './components/ProtectedRoute';
import DownloadArt from './pages/DownloadArt';
import ForgotPassword from './pages/ForgotPassword';
import OwnerDashboard from './pages/OwnerDashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '61291256925-6us84l9324uuf90v78e875mqgrfqtt1c.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/owner-login" element={<OwnerLogin />} />
              <Route path="/experts" element={<ExpertOwnerSearch />} />
              <Route path="/download/:id" element={<DownloadArt />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute allowedRoles={['artist', 'owner']}>
                  <UploadArt />
                </ProtectedRoute>
              } />

              <Route path="/owner-dashboard" element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
