import shopsData from '../../data/shops.json';

export interface Treatment {
    name: string;
    price: number;
}

export interface Shop {
    id: string;
    name: string;
    category: string;
    region: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    review_count: number;
    languages: string[];
    base_price: string;
    treatments: Treatment[];
    image_url: string;
    created_at: string;
}

export interface SearchFilters {
    query?: string;
    category?: string;
    region?: string;
    minRating?: number;
    maxPrice?: number;
}

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const shopApi = {
    /**
     * 모든 샵 데이터 가져오기 (디버깅용)
     */
    getAllShops: async (): Promise<Shop[]> => {
        await delay(300);
        return shopsData as Shop[];
    },

    /**
     * 필터링된 샵 리스트 검색 (AI 챗봇용 & 탐색 UI용)
     */
    searchShops: async (filters: SearchFilters): Promise<Shop[]> => {
        await delay(500); // Simulate network latency
        let results = shopsData as Shop[];

        if (filters.query) {
            const q = filters.query.toLowerCase();
            results = results.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.treatments.some(t => t.name.toLowerCase().includes(q))
            );
        }

        if (filters.category) {
            results = results.filter(s => s.category === filters.category);
        }

        if (filters.region) {
            // Handle variations like "강남", "강남구", "Gangnam"
            const r = filters.region.toLowerCase();
            results = results.filter(s =>
                s.region.toLowerCase().includes(r) ||
                s.address.toLowerCase().includes(r)
            );
        }

        if (filters.minRating) {
            results = results.filter(s => s.rating >= filters.minRating!);
        }

        if (filters.maxPrice) {
            results = results.filter(s => {
                // Check if ANY treatment is under the max price
                return s.treatments.some(t => t.price <= filters.maxPrice!);
            });
        }

        // Sort by rating (descending) by default to show best places first
        results.sort((a, b) => b.rating - a.rating);

        return results;
    },

    /**
     * ID로 특정 샵 찾기
     */
    getShopById: async (id: string): Promise<Shop | undefined> => {
        await delay(200);
        return (shopsData as Shop[]).find(s => s.id === id);
    }
};
