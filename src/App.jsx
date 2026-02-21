import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-white relative font-['Inter']">
                <Routes>
                    <Route path="/" element={<DatabaseConnection />} />

                    <Route path="/explorer" element={<MainLayout><Explorer /></MainLayout>} />
                    <Route path="/table-detail" element={<MainLayout><TableDetail /></MainLayout>} />
                    <Route path="/ai-chat" element={<MainLayout><AIChat /></MainLayout>} />

                    <Route path="/queries" element={<MainLayout><Queries /></MainLayout>} />
                    <Route path="/insights" element={<MainLayout><Insights /></MainLayout>} />
                    <Route path="/security" element={<MainLayout><Security /></MainLayout>} />
                    <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
                    <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
