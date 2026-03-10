import { User, Heart, Calendar, ChevronRight, Settings, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * 📱 마이페이지
 * 프로필, 예약 내역, 위시리스트
 */
export default function MyPage() {
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookingsCount, setBookingsCount] = useState(0);
    const [wishlistsCount, setWishlistsCount] = useState(0);

    const fetchCounts = async (userId: string) => {
        // Since we don't have user_id strictly tied to bookings via API right now, 
        // we might just fetch all for MVP, or just fetch if we have user_id. 
        // We'll fetch all bookings to show *something* for demo if they exist.
        const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        setBookingsCount(bCount || 0);

        const { count: wCount } = await supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        setWishlistsCount(wCount || 0);
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.id) fetchCounts(session.user.id);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.id) {
                fetchCounts(session.user.id);
            } else {
                setBookingsCount(0);
                setWishlistsCount(0);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/mypage'
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
            alert('로그인 시도 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    return (
        <div className="min-h-screen bg-background pb-20 safe-area-top">
            {/* 프로필 헤더 */}
            <div className="bg-gradient-to-br from-primary to-primary-light px-6 pt-16 pb-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {session?.user?.user_metadata?.avatar_url ? (
                            <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">
                            {session ? session.user.user_metadata?.full_name || session.user.email?.split('@')[0] : '로그인 해주세요'}
                        </h2>
                        <p className="text-sm text-white/70">
                            {session ? session.user.email : 'K-뷰티 여정을 시작하세요'}
                        </p>
                    </div>
                </div>
                {!session ? (
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-4 w-full py-3 rounded-2xl bg-white/20 text-sm font-bold hover:bg-white/30 transition-colors cursor-pointer"
                    >
                        {loading ? '로그인 중...' : '구글 계정으로 로그인 / 회원가입'}
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="mt-4 w-full py-3 rounded-2xl bg-white/20 text-sm font-bold hover:bg-white/30 transition-colors cursor-pointer"
                    >
                        로그아웃
                    </button>
                )}
            </div>

            <div className="px-4 py-6 space-y-3">
                {/* 메뉴 리스트 */}
                {[
                    { icon: <Calendar className="w-5 h-5" />, label: '예약 내역', desc: '과거 및 예정된 예약', badge: bookingsCount > 0 ? bookingsCount.toString() : null, path: '/bookings' },
                    { icon: <Heart className="w-5 h-5" />, label: '위시리스트', desc: '저장한 뷰티샵', badge: wishlistsCount > 0 ? wishlistsCount.toString() : null, path: '/wishlists' },
                    { icon: <Bell className="w-5 h-5" />, label: '알림 설정', desc: '푸시 알림 및 마케팅 수신', path: '#' },
                    { icon: <Settings className="w-5 h-5" />, label: '설정', desc: '언어, 테마, 계정 관리', path: '#' },
                    { icon: <LogOut className="w-5 h-5" />, label: '고객센터', desc: '문의 및 FAQ', path: '#' },
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={() => item.path !== '#' && navigate(item.path)}
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
