import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { phone, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!phone) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** 用 path 做 key，每次路由变化强制 GamePage 重新挂载 */
function GamePageWrapper() {
  const { '*': path } = useParams();
  return <GamePage key={path} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="h-full max-w-md mx-auto bg-white relative overflow-hidden pb-safe">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/game/*" element={<ProtectedRoute><GamePageWrapper /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}
