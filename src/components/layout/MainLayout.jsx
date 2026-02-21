import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function MainLayout({ children, showNav = true }) {
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {showNav && <Sidebar />}

            <main className="flex-1 flex flex-col relative w-full">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                {showNav && <BottomNav />}
            </main>
        </div>
    );
}
