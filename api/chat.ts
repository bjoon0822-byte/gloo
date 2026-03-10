import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Vercel Edge/Serverless에서 동작하는 Supabase 클라이언트
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

// 샵 검색 로직 (Supabase DB 직접 쿼리)
async function searchShops(filters: {
    query?: string;
    category?: string;
    region?: string;
    maxPrice?: number;
}) {
    let query = supabase.from('shops').select('*');

    if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`);
    }
    if (filters.query) {
        const q = filters.query.replace(/\s+/g, '%');
        query = query.or(`name.ilike.%${q}%,region.ilike.%${q}%,city.ilike.%${q}%`);
    }
    if (filters.region) {
        query = query.or(`region.ilike.%${filters.region}%,address.ilike.%${filters.region}%,city.ilike.%${filters.region}%`);
    }

    query = query.limit(50);
    const { data, error } = await query;

    if (error) {
        console.error('Supabase Error:', error);
        return [];
    }

    let results = data || [];

    // 가격 필터링 (JSONB 후처리)
    if (filters.maxPrice) {
        results = results.filter((s: any) => {
            if (!s.treatments || s.treatments.length === 0) return false;
            const minPrice = Math.min(...s.treatments.map((t: any) => t.price));
            return minPrice <= filters.maxPrice!;
        });
    }

    // 브랜드 우선 + 평점순 정렬
    const brandKeywords = [
        '준오헤어', '차앤박', '톡스앤필', '뮤즈클리닉', '리엔장', '쁨의원',
        '아이디병원', '원진성형외과', '바노바기', '순수', '차홍룸', '이가자',
        '박승철', '리안헤어', '올리브영', '닥터쁘띠', '청담', '오라클'
    ];

    results.sort((a: any, b: any) => {
        const isABrand = brandKeywords.some(brand => a.name.includes(brand));
        const isBBrand = brandKeywords.some(brand => b.name.includes(brand));
        if (isABrand && !isBBrand) return -1;
        if (!isABrand && isBBrand) return 1;
        return (b.rating || 0) - (a.rating || 0);
    });

    return results.slice(0, 20);
}

// AI SDK 스트리밍 최대 시간 (Vercel Pro: 60초, Free: 10초)
export const maxDuration = 30;

// Web API Request/Response 형식 (Vercel Edge 호환)
export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemPrompt = `You are a professional beauty & medical appointment consultant for the 'GLOO' platform.
You manage the entire consultation flow: understanding concerns, scheduling, and booking.

CONVERSATION FLOW (follow this order strictly):
Step 1 - UNDERSTAND: Ask what the user's concern or desired treatment is. Listen carefully.
Step 2 - CONSULT: Based on their concern, briefly explain the medical/beauty approach. Then ask:
  a) Preferred region/city
  b) Preferred schedule
  c) Budget range (optional)
Step 3 - RECOMMEND & RANK: Once you have enough info, use 'search_shops' tool. Rank them (1지망, 2지망, 3지망).
Step 4 - NEXT STEP UPSELL: After recommending the main treatment, suggest one complementary "next step" treatment.

SPECIAL FLOW - FULL-DAY PACKAGE ITINERARY:
If the user indicates they have a FULL DAY available or a HIGH BUDGET, design a structured sequence of 3 different treatments as a "Beauty Day Package".

MEDICAL KNOWLEDGE:
- 여드름: 살리실산 필링, PDT, 레이저 토닝 추천
- 색소침착/기미: 피코레이저, 레이저 토닝 추천
- 주름/탄력: 써마지 FLX, 울쎄라, 인모드 추천
- 피로회복/힐링: 전신 아로마 마사지, VIP 헤드스파 추천

CRITICAL RULES:
1. MAXIMAL VISUAL, EXTREME MINIMAL TEXT. DO NOT write long explanations.
2. Just say exactly ONE SHORT SENTENCE and STOP. Let the UI cards do the talking.
3. ABSOLUTELY NO MARKDOWN: No asterisks(**), no hashtags(#). Plain Korean text only.`;

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            messages,
            maxSteps: 3,
            tools: {
                search_shops: tool({
                    description: 'Search for beauty shops, clinics, or salons based on user criteria like region, category, or treatment.',
                    parameters: z.object({
                        region: z.string().optional().describe('Region or city name'),
                        category: z.string().optional().describe('Type of shop: 피부과, 헤어살롱, 메이크업, 에스테틱, 성형외과, 네일아트, 왁싱, 반영구, 두피관리'),
                        max_price: z.number().optional().describe('Maximum budget in Korean Won (KRW)'),
                        query: z.string().optional().describe('Specific treatment name'),
                    }),
                    execute: async ({ region, category, max_price, query }) => {
                        console.log(`[Tool Call] search_shops:`, { region, category, max_price, query });
                        const results = await searchShops({
                            region,
                            category,
                            maxPrice: max_price,
                            query
                        });
                        return results.slice(0, 3).map((shop: any) => ({
                            id: shop.id,
                            name: shop.name,
                            region: shop.region,
                            city: shop.city,
                            category: shop.category,
                            image_url: shop.image_url,
                            operating_hours: shop.operating_hours,
                            rating: shop.rating,
                            lat: shop.lat,
                            lng: shop.lng,
                            address: shop.address,
                            treatments: shop.treatments
                        }));
                    },
                }),
            },
        });

        // AI SDK의 toDataStreamResponse()는 Web Response 객체를 반환
        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
