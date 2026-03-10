/* 챗봇 메시지 타입 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    toolInvocations?: any[];
}

/* 샵 데이터 타입 */
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
