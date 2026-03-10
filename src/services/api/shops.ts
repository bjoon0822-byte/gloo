import { supabase } from '../../lib/supabase';

export interface Treatment {
    name: string;
    price: number;
}

export interface Shop {
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
    languages: string[];
    base_price: string;
    treatments: Treatment[];
    image_url: string;
    operating_hours?: string;
    created_at: string;
}

export interface SearchFilters {
    query?: string;
    category?: string;
    region?: string;
    minRating?: number;
    maxPrice?: number;
}

export const shopApi = {
    /**
     * 모든 샵 데이터 100개 가져오기 (디버깅용)
     */
    getAllShops: async (): Promise<Shop[]> => {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .limit(100);

        if (error) {
            console.error("Supabase Error fetching all shops:", error);
            return [];
        }
        return data as Shop[];
    },

    /**
     * 필터링된 샵 리스트 검색 (AI 챗봇용 & 탐색 UI용 - Supabase DB Query)
     */
    searchShops: async (filters: SearchFilters): Promise<Shop[]> => {
        console.log(`[Supabase Query] start with filters:`, filters);

        // Supabase DB query
        let query = supabase.from('shops').select('*');

        // Category Filter
        if (filters.category) {
            query = query.ilike('category', `%${filters.category}%`);
        }

        // Query Filter (General search term)
        if (filters.query) {
            const q = filters.query.replace(/\s+/g, '%');
            query = query.or(`name.ilike.%${q}%,region.ilike.%${q}%,city.ilike.%${q}%`);
        }

        // Region Filter
        if (filters.region) {
            query = query.or(`region.ilike.%${filters.region}%,address.ilike.%${filters.region}%,city.ilike.%${filters.region}%`);
        }

        // Rating Filter
        if (filters.minRating) {
            query = query.gte('rating', filters.minRating);
        }

        // Fetch up to 50 items
        query = query.limit(50);

        const { data, error } = await query;
        if (error) {
            console.error("Supabase Error searching shops:", error);
            return [];
        }

        let results = data as Shop[];

        // After-fetch processing since JSONB filtering can be complex in pure Postgrest
        if (filters.maxPrice) {
            results = results.filter(s => {
                if (!s.treatments || s.treatments.length === 0) return false;
                const minPrice = Math.min(...s.treatments.map(t => t.price));
                return minPrice <= filters.maxPrice!;
            });
        }

        // Brand Priority Sorting
        const brandKeywords = [
            '준오헤어', '차앤박', '톡스앤필', '뮤즈클리닉', '리엔장', '쁨의원',
            '아이디병원', '원진성형외과', '디에이성형외과', '바노바기', '순수',
            '차홍룸', '플랜에이치', '이가자', '박승철', '리안헤어', '끌림',
            '드럭스토어', '올리브영', '닥터쁘띠', '미올', '청담', '리더스',
            '아이러브', '오라클', '더마플라자'
        ];

        results.sort((a, b) => {
            const isABrand = brandKeywords.some(brand => a.name.includes(brand));
            const isBBrand = brandKeywords.some(brand => b.name.includes(brand));

            if (isABrand && !isBBrand) return -1;
            if (!isABrand && isBBrand) return 1;

            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA;
        });

        // Return top 20 limit back to caller
        return results.slice(0, 20);
    },

    getShopById: async (id: string): Promise<Shop | null> => {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Supabase Error getShopById:", error);
            return null;
        }
        return data as Shop;
    }
};
