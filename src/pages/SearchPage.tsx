import { Search, MapPin, Star, Filter } from 'lucide-react';
import { useState } from 'react';

/**
 * 📱 샵 탐색 페이지
 * 검색 + 필터 + 샵 리스트 (향후 지도 기반 검색 추가)
 */
export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // 인기 카테고리
    const categories = [
        { label: '피부과', emoji: '🏥' },
        { label: '헤어살롱', emoji: '💇' },
        { label: '에스테틱', emoji: '✨' },
        { label: '성형외과', emoji: '🩺' },
        { label: '네일아트', emoji: '💅' },
        { label: '메이크업', emoji: '💄' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 safe-area-top">
            {/* 검색 헤더 */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="지역, 시술, 샵 이름 검색"
                            className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
                        <Filter className="w-4 h-4 text-primary" />
                    </button>
                </div>
            </div>

            <div className="px-4 py-6">
                {/* 카테고리 */}
                <h3 className="text-sm font-bold text-text mb-3">카테고리</h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.label}
                            className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                        >
                            <span className="text-2xl">{cat.emoji}</span>
                            <span className="text-xs font-medium text-text">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* 인기 지역 */}
                <h3 className="text-sm font-bold text-text mb-3">인기 지역</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                    {['강남', '홍대', '명동', '압구정', '신사', '이태원', '성수', '해운대'].map((area) => (
                        <button
                            key={area}
                            className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border border-gray-100 text-xs font-medium text-text hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                        >
                            <MapPin className="w-3 h-3" />
                            {area}
                        </button>
                    ))}
                </div>

                {/* 추천 샵 (향후 Supabase 연동) */}
                <h3 className="text-sm font-bold text-text mb-3">추천 뷰티샵</h3>
                <div className="space-y-3">
                    {[
                        { name: '청담 뮤즈클리닉', category: '피부과', region: '강남', rating: 4.9, price: '150,000' },
                        { name: '준오헤어 압구정점', category: '헤어살롱', region: '압구정', rating: 4.8, price: '80,000' },
                        { name: '순수 에스테틱 명동', category: '에스테틱', region: '명동', rating: 4.7, price: '120,000' },
                    ].map((shop) => (
                        <div key={shop.name} className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-sm text-text">{shop.name}</h4>
                                <p className="text-[10px] text-text-muted">#{shop.category} #{shop.region}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex items-center gap-0.5">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold">{shop.rating}</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">{shop.price}원~</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
