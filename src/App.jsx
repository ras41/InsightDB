import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';

import Login from './pages/Login';
import DatabaseConnection from './pages/DatabaseConnection';
import Explorer from './pages/Explorer';
import TableDetail from './pages/TableDetail';
import AIChat from './pages/AIChat';
import Queries from './pages/Queries';
import Insights from './pages/Insights';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import MainLayout from './components/layout/MainLayout';

function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }
    return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />

            <Route path="/" element={<ProtectedRoute><DatabaseConnection /></ProtectedRoute>} />

            <Route path="/explorer" element={<ProtectedRoute><MainLayout><Explorer /></MainLayout></ProtectedRoute>} />
            <Route path="/table-detail" element={<ProtectedRoute><MainLayout><TableDetail /></MainLayout></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><MainLayout><AIChat /></MainLayout></ProtectedRoute>} />

            <Route path="/queries" element={<ProtectedRoute><MainLayout><Queries /></MainLayout></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><MainLayout><Insights /></MainLayout></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><MainLayout><Security /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <ConnectionProvider>
                <Router>
                    <div className="min-h-screen bg-white relative font-['Inter']">
                        <AppRoutes />
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: { background: '#0f172a', color: '#fff', borderRadius: '16px', fontWeight: 700, fontSize: '14px' },
                                success: { iconTheme: { primary: '#6d28d9', secondary: '#fff' } },
                                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                            }}
                        />
                    </div>
                </Router>
            </ConnectionProvider>
        </AuthProvider>
    );
}

export default App;
