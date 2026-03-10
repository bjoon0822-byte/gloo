import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, MapPin, Clock, Phone, Copy, Share, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import type { Shop } from '../types';

export default function ShopDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'treatments' | 'info' | 'reviews'>('treatments');

    // Simulate fetching shop data based on ID
    useEffect(() => {
        const fetchShop = async () => {
            try {
                // In a real app, you'd fetch from your API/Supabase:
                const { data, error } = await supabase.from('shops').select('*').eq('id', id).single();

                if (error) throw error;

                if (data) {
                    setShop(data as Shop);
                } else {
                    setShop(null);
                }
                setLoading(false);

            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchShop();
    }, [id]);

    const handleCopyAddress = () => {
        if (shop?.address) {
            navigator.clipboard.writeText(shop.address);
            alert('주소가 복사되었습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[100dvh] pt-12 items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="flex h-[100dvh] flex-col items-center justify-center bg-gray-50 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">샵을 찾을 수 없습니다</h2>
                <p className="text-sm text-gray-500 mb-6 font-medium text-center">요청하신 샵 정보가 존재하지 않습니다.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark cursor-pointer">
                    뒤로 가기
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-white pb-[90px]">
            {/* 상단 네비게이션 */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex gap-1 border border-gray-100 rounded-full p-1 bg-white">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-colors cursor-pointer">
                        <Heart className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <Share className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 헤더 사진 */}
            <div className="w-full h-[280px] bg-gray-200 mt-14 relative">
                {shop.image_url ? (
                    <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                        <span className="text-gray-400 font-medium">{shop.name}</span>
                    </div>
                )}
            </div>

            {/* 샵 메인 정보 타이틀 */}
            <div className="px-5 pb-6 pt-5 bg-white relative rounded-t-3xl -mt-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">{shop.category}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{shop.region}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2 tracking-tight">
                    {shop.name}
                </h1>

                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{shop.rating.toFixed(1)}</span>
                        <span className="text-gray-400 font-normal underline ml-0.5">(124+ 리뷰)</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 flex gap-2 items-center bg-gray-50 rounded-xl p-3">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{shop.address}</span>
                    </div>
                    <div className="flex-1 flex gap-2 items-center bg-gray-50 rounded-xl p-3">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{shop.operating_hours || '10:00 - 20:00'}</span>
                    </div>
                </div>
            </div>

            {/* 탭 헤더 */}
            <div className="sticky top-14 bg-white z-40 border-b border-gray-100 flex pb-0 pt-2 px-1">
                <button
                    onClick={() => setActiveTab('treatments')}
                    className={`flex-1 pb-3 text-[13px] font-bold cursor-pointer relative transition-colors ${activeTab === 'treatments' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    시술 메뉴
                    {activeTab === 'treatments' && <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-1 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 pb-3 text-[13px] font-bold cursor-pointer relative transition-colors ${activeTab === 'info' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    매장 정보
                    {activeTab === 'info' && <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-1 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 pb-3 text-[13px] font-bold cursor-pointer relative transition-colors ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    리뷰 (124+)
                    {activeTab === 'reviews' && <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-1 bg-primary rounded-t-full" />}
                </button>
            </div>

            {/* 탭 메인 컨텐츠 */}
            <div className="bg-gray-50 flex-1 px-5 py-6">

                {/* 시술 탭 */}
                {activeTab === 'treatments' && (
                    <div className="space-y-4 animate-in fade-in fill-mode-both duration-300 slide-in-from-bottom-2">
                        {shop.treatments?.map((t: any, idx: number) => {
                            const originalPrice = Math.round(t.price * 1.3);
                            const discountRate = Math.round(((originalPrice - t.price) / originalPrice) * 100);

                            return (
                                <div key={idx} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col cursor-pointer hover:border-pink-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 text-[15px]">{t.name}</h3>
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-snug mb-4">
                                        이 시술은 외국인 전용 프로모션 혜택이 적용됩니다. 추가 세금 환급이 가능합니다.
                                    </p>
                                    <div className="flex justify-between items-end mt-auto">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-pink-500 text-sm">{discountRate}%</span>
                                            <span className="text-gray-400 text-[11px] line-through decoration-gray-300">
                                                {originalPrice.toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="font-extrabold text-gray-900 text-lg tracking-tight">
                                            {t.price.toLocaleString()}원
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!shop.treatments || shop.treatments.length === 0) && (
                            <p className="text-xs text-gray-500 py-10 text-center">등록된 시술 메뉴가 없습니다.</p>
                        )}
                    </div>
                )}

                {/* 정보 탭 */}
                {activeTab === 'info' && (
                    <div className="space-y-5 animate-in fade-in fill-mode-both duration-300 slide-in-from-bottom-2">
                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50">
                            <h3 className="font-bold text-gray-900 text-[15px] mb-4">위치 안내</h3>
                            <div className="w-full h-[180px] rounded-xl overflow-hidden mb-4 bg-gray-100 border border-gray-200">
                                {shop.lat && shop.lng ? (
                                    <MapContainer
                                        center={[shop.lat, shop.lng] as [number, number]}
                                        zoom={16}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[shop.lat, shop.lng] as [number, number]}>
                                            <Popup className="text-xs font-bold">
                                                {shop.name}
                                                <br />
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`} target="_blank" rel="noopener noreferrer" className="text-primary mt-1 inline-block">Google 지도 보기</a>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <MapPin className="w-6 h-6 mb-2 opacity-50" />
                                        <span className="text-xs font-medium">지도 정보를 불러올 수 없습니다.</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-200">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-800 font-medium truncate">{shop.address}</p>
                                </div>
                                <button onClick={handleCopyAddress} className="bg-white border text-gray-600 border-gray-200 text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 hover:bg-gray-50 cursor-pointer flex items-center gap-1 transition-colors">
                                    <Copy className="w-3 h-3" /> 복사
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50 space-y-4">
                            <div className="flex items-center gap-4">
                                <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                                <div className="text-[13px]">
                                    <p className="font-bold text-gray-800 mb-0.5">영업 시간</p>
                                    <p className="text-gray-600 font-medium">{shop.operating_hours || '상세 정보 없음'}</p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-gray-100" />
                            <div className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                                <div className="text-[13px]">
                                    <p className="font-bold text-gray-800 mb-0.5">전화번호</p>
                                    <p className="text-gray-600 font-medium">02-1234-5678</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 리뷰 탭 */}
                {activeTab === 'reviews' && (
                    <div className="space-y-4 animate-in fade-in fill-mode-both duration-300 slide-in-from-bottom-2">
                        {/* 더미 리뷰들 */}
                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-500">M</div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-800">Maria S.</p>
                                    <div className="flex text-yellow-400 mt-0.5">
                                        <Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" />
                                    </div>
                                </div>
                                <div className="ml-auto text-[10px] text-gray-400">1일 전</div>
                            </div>
                            <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/review1/400/200)' }} />
                            <p className="text-[12px] text-gray-600 leading-relaxed">
                                Really amazing experience! The staff was super friendly, and the doctor explained everything clearly in English. The aqua peel made my skin feel so refreshed.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center font-bold text-pink-500">K</div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-800">Kelsie T.</p>
                                    <div className="flex text-yellow-400 mt-0.5">
                                        <Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3 fill-yellow-400" /><Star className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="ml-auto text-[10px] text-gray-400">3일 전</div>
                            </div>
                            <p className="text-[12px] text-gray-600 leading-relaxed">
                                It was quite busy but they handled it well. The lifting laser treatment hurt a little but the results are already showing. Definitely coming back when I visit Korea again.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 플로팅 라우팅 CTA (AI 챗/예약) */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 safe-area-bottom px-4 pt-3 pb-8">
                <Link
                    to={`/chat?booking_shop_id=${shop.id}&shop_name=${encodeURIComponent(shop.name)}`}
                    className="w-full bg-gradient-to-r from-primary to-primary-light text-white font-extrabold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(255,107,158,0.5)] transition-transform active:scale-[0.98] cursor-pointer no-underline"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>AI 컨시어지로 방문 예약하기</span>
                </Link>
            </div>
            {/* CTA 하단 그림자를 위한 스페이서 */}
            <div className="h-10" />
        </div>
    );
}

