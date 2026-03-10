import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Shop } from '../types';

export default function WishlistPage() {
    const navigate = useNavigate();
    const [wishlistShops, setWishlistShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const user = sessionData?.session?.user;

                if (!user) {
                    setLoading(false);
                    return;
                }

                // Get wishlist shop IDs for this user
                const { data: wishlists, error: wishError } = await supabase
                    .from('wishlists')
                    .select('shop_id')
                    .eq('user_id', user.id);

                if (wishError) throw wishError;

                if (!wishlists || wishlists.length === 0) {
                    setLoading(false);
                    return;
                }

                const shopIds = wishlists.map(w => w.shop_id);

                // Fetch shop details
                const { data: shops, error: shopsError } = await supabase
                    .from('shops')
                    .select('*')
                    .in('id', shopIds);

                if (shopsError) throw shopsError;

                setWishlistShops((shops as Shop[]) || []);
            } catch (error) {
                console.error('Error fetching wishlists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 safe-area-top">
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <h1 className="text-base font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                    위시리스트
                </h1>
                <div className="w-10" />
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center p-10">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : wishlistShops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-pink-300" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">저장한 뷰티샵이 없습니다.</p>
                        <p className="text-gray-400 text-xs mt-1">마음에 드는 뷰티샵을 하트로 찜해보세요!</p>
                        <button onClick={() => navigate('/search')} className="mt-6 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm">
                            뷰티샵 찾아보기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wishlistShops.map(shop => (
                            <div
                                key={shop.id}
                                onClick={() => navigate(`/shop/${shop.id}`)}
                                className="bg-white rounded-2xl p-3 shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                                    {shop.image_url ? (
                                        <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs font-medium">{shop.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 py-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            {shop.category}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span>{shop.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-extrabold text-gray-900 text-[15px] mb-1 leading-tight line-clamp-1">
                                        {shop.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{shop.address}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-xs font-bold text-gray-800">
                                            {shop.base_price ? `${Number(shop.base_price).toLocaleString()}원~` : '가격 정보 없음'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
