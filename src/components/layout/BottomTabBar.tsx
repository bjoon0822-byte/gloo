import { Home, MessageCircle, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 📱 모바일 하단 탭 네비게이션
 * 홈 / AI 채팅 / 탐색 / 마이페이지
 */
const tabs = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/chat', icon: MessageCircle, label: 'AI 채팅' },
    { path: '/search', icon: Search, label: '탐색' },
    { path: '/mypage', icon: User, label: 'MY' },
];

export default function BottomTabBar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors cursor-pointer ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
