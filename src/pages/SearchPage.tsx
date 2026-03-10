import { Search, MapPin, Star, X, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 📱 샵 탐색 페이지
 * Supabase에서 실시간 샵 데이터를 검색 + 필터링
 */

interface Treatment {
    name: string;
    price: number;
}

interface Shop {
    id: string;
    name: string;
    category: string;
    region: string;
    city: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    review_count: number;
    image_url: string;
    treatments: Treatment[];
    operating_hours?: string;
}

// 카테고리 목록
const categories = [
    { label: '전체', emoji: '✨', value: '' },
    { label: '피부과', emoji: '🏥', value: '피부과' },
    { label: '헤어살롱', emoji: '💇', value: '헤어살롱' },
    { label: '에스테틱', emoji: '💆', value: '에스테틱' },
    { label: '성형외과', emoji: '🩺', value: '성형외과' },
    { label: '네일아트', emoji: '💅', value: '네일아트' },
    { label: '메이크업', emoji: '💄', value: '메이크업' },
    { label: '왁싱', emoji: '🪒', value: '왁싱' },
    { label: '두피관리', emoji: '🧴', value: '두피관리' },
];

// 인기 지역
const popularAreas = ['강남', '홍대', '명동', '압구정', '신사', '이태원', '성수', '해운대', '서면', '판교'];

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Supabase에서 샵 데이터 검색
    const fetchShops = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('shops').select('*', { count: 'exact' });

            // 카테고리 필터
            if (selectedCategory) {
                query = query.ilike('category', `%${selectedCategory}%`);
            }

            // 지역 필터
            if (selectedRegion) {
                query = query.or(`region.ilike.%${selectedRegion}%,address.ilike.%${selectedRegion}%,city.ilike.%${selectedRegion}%`);
            }

            // 검색어 필터
            if (searchQuery.trim()) {
                const q = searchQuery.trim().replace(/\s+/g, '%');
                query = query.or(`name.ilike.%${q}%,region.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`);
            }

            // 평점 높은 순 정렬, 최대 30개
            query = query.order('rating', { ascending: false }).limit(30);

            const { data, error, count } = await query;

            if (error) {
                console.error('Supabase search error:', error);
                return;
            }

            setShops((data || []) as Shop[]);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, selectedRegion]);

    // 필터 변경 시 자동 검색
    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    // 검색어 입력 시 디바운스 (300ms)
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(debouncedQuery), 300);
        return () => clearTimeout(timer);
    }, [debouncedQuery]);

    // 필터 초기화
    const clearFilters = () => {
        setDebouncedQuery('');
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedRegion('');
    };

    const hasFilters = selectedCategory || selectedRegion || searchQuery;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* 검색 헤더 */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={debouncedQuery}
                                onChange={(e) => setDebouncedQuery(e.target.value)}
                                placeholder="지역, 시술, 샵 이름 검색"
                                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                            />
                            {debouncedQuery && (
                                <button onClick={() => { setDebouncedQuery(''); setSearchQuery(''); }} className="cursor-pointer">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold cursor-pointer whitespace-nowrap"
                            >
                                초기화
                            </button>
                        )}
                    </div>
                </div>

                {/* 카테고리 스크롤 */}
                <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setSelectedCategory(prev => prev === cat.value ? '' : cat.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.value
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-text hover:border-primary/30'
                                    }`}
                            >
                                <span>{cat.emoji}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 py-4">
                {/* 인기 지역 (필터가 없을 때만 표시) */}
                {!hasFilters && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-text mb-2.5">인기 지역</h3>
                        <div className="flex flex-wrap gap-2">
                            {popularAreas.map((area) => (
                                <button
                                    key={area}
                                    onClick={() => setSelectedRegion(prev => prev === area ? '' : area)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${selectedRegion === area
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-gray-100 text-text hover:border-primary/30 hover:text-primary'
                                        }`}
                                >
                                    <MapPin className="w-3 h-3" />
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 결과 카운트 */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-text">
                        {hasFilters ? '검색 결과' : '추천 뷰티샵'}
                        <span className="text-text-muted font-normal ml-1.5">{totalCount}개</span>
                    </h3>
                    {selectedRegion && (
                        <button
                            onClick={() => setSelectedRegion('')}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold cursor-pointer"
                        >
                            <MapPin className="w-2.5 h-2.5" />
                            {selectedRegion}
                            <X className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>

                {/* 로딩 */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {/* 결과 없음 */}
                {!loading && shops.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-text-muted">검색 결과가 없습니다</p>
                        <button onClick={clearFilters} className="mt-3 text-xs text-primary font-bold cursor-pointer">필터 초기화</button>
                    </div>
                )}

                {/* 샵 리스트 */}
                {!loading && shops.length > 0 && (
                    <div className="space-y-3">
                        {shops.map((shop) => {
                            const treatment = shop.treatments?.[0];
                            const originalPrice = treatment ? Math.round(treatment.price * 1.3) : 0;
                            const discountRate = treatment ? Math.round((originalPrice - treatment.price) / originalPrice * 100) : 0;

                            const mapUrl = shop.lat && shop.lng
                                ? `https://map.kakao.com/link/map/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}`
                                : `https://map.kakao.com/link/search/${encodeURIComponent(shop.name)}`;

                            return (
                                <a
                                    key={shop.id}
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer no-underline text-inherit block"
                                >
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-primary/5">
                                        {shop.image_url ? (
                                            <img
                                                src={shop.image_url}
                                                alt={shop.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${shop.id}/200/200`; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-primary/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <h4 className="font-bold text-sm text-text truncate">{shop.name}</h4>
                                        <p className="text-[10px] text-text-muted mb-1 truncate">
                                            #{shop.category} {shop.treatments?.slice(0, 2).map((t) => `#${t.name.split(' ')[0]}`).join(' ')}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-1.5">
                                            <MapPin className="w-3 h-3 text-primary/60" />
                                            <span className="truncate">{shop.region} · {shop.city || shop.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs font-bold">{shop.rating?.toFixed(1)}</span>
                                            </div>
                                            {treatment && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-extrabold text-text">{treatment.price.toLocaleString()}원</span>
                                                    <span className="text-[10px] font-bold text-pink-500">{discountRate}%</span>
                                                    <span className="text-[10px] text-gray-400 line-through">{originalPrice.toLocaleString()}원</span>
                                                </div>
                                            )}
                                        </div>
                                        {shop.operating_hours && (
                                            <span className="text-[9px] text-text-muted mt-0.5">🕒 {shop.operating_hours}</span>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
