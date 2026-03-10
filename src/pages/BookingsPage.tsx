import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BookingsPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Determine user session to filter bookings if user_id exists, 
                // but for MVP we might fetch all confirmed bookings or mock some context if table is open
                await supabase.auth.getSession();
                let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

                // If user auth is strictly enforced on bookings, we would filter here.
                // q = q.eq('user_id', sessionData?.session?.user.id)

                const { data, error } = await query;
                if (error) throw error;
                setBookings(data || []);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 safe-area-top">
            {/* 상단 네비게이션 */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-base font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                    내 예약 내역
                </h1>
                <div className="w-10" />
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-10">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">진행 중인 예약이 없습니다.</p>
                        <p className="text-gray-400 text-xs mt-1">마음에 드는 뷰티샵을 찾아 예약해보세요!</p>
                        <button onClick={() => navigate('/search')} className="mt-6 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm">
                            뷰티샵 찾아보기
                        </button>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.booking_id || booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-[11px] font-bold">
                                    {booking.status === 'confirmed' ? '예약 확정' : '결제 대기'}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">예약번호: {booking.booking_id}</span>
                            </div>
                            <h3 className="font-extrabold text-lg text-gray-900 mb-4">{booking.shop_name}</h3>
                            <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="font-medium text-gray-700">{booking.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="font-medium text-gray-700">{booking.time}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
