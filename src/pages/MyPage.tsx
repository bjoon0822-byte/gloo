import { User, Heart, Calendar, ChevronRight, Settings, LogOut, Bell } from 'lucide-react';

/**
 * 📱 마이페이지
 * 프로필, 예약 내역, 위시리스트
 */
export default function MyPage() {
    return (
        <div className="min-h-screen bg-background pb-20 safe-area-top">
            {/* 프로필 헤더 */}
            <div className="bg-gradient-to-br from-primary to-primary-light px-6 pt-16 pb-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">로그인 해주세요</h2>
                        <p className="text-sm text-white/70">K-뷰티 여정을 시작하세요</p>
                    </div>
                </div>
                <button className="mt-4 w-full py-3 rounded-2xl bg-white/20 text-sm font-bold hover:bg-white/30 transition-colors cursor-pointer">
                    로그인 / 회원가입
                </button>
            </div>

            <div className="px-4 py-6 space-y-3">
                {/* 메뉴 리스트 */}
                {[
                    { icon: <Calendar className="w-5 h-5" />, label: '예약 내역', desc: '과거 및 예정된 예약', badge: '0' },
                    { icon: <Heart className="w-5 h-5" />, label: '위시리스트', desc: '저장한 뷰티샵', badge: '0' },
                    { icon: <Bell className="w-5 h-5" />, label: '알림 설정', desc: '푸시 알림 및 마케팅 수신' },
                    { icon: <Settings className="w-5 h-5" />, label: '설정', desc: '언어, 테마, 계정 관리' },
                    { icon: <LogOut className="w-5 h-5" />, label: '고객센터', desc: '문의 및 FAQ' },
                ].map((item) => (
                    <button
                        key={item.label}
                        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-text">{item.label}</span>
                                {item.badge && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{item.badge}</span>
                                )}
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                ))}
            </div>

            {/* 앱 버전 */}
            <div className="text-center py-4">
                <p className="text-[10px] text-text-muted">GLOO v1.0.0</p>
            </div>
        </div>
    );
}
