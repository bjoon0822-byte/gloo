import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { shopApi } from '../src/services/api/shops.js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Use Node.js runtime for better compatibility with Zod and AI SDK tools
export const config = {
    runtime: 'nodejs',
};

export async function POST(req: Request) {
    const { messages } = await req.json();

    const systemPrompt = `You are a professional beauty & medical appointment consultant for the 'GLOO' platform.
You manage the entire consultation flow: understanding concerns, scheduling, and booking.

CONVERSATION FLOW (follow this order strictly):
Step 1 - UNDERSTAND: Ask what the user's concern or desired treatment is. Listen carefully.
Step 2 - CONSULT: Based on their concern, briefly explain the medical/beauty approach (use the knowledge below). Then ask:
  a) Preferred region/city
  b) Preferred schedule (이번 주? 다음 주? 오전/오후?)
  c) Budget range (optional)
Step 3 - RECOMMEND & RANK (Single Treatment): Once you have enough info, use 'search_shops' tool. When presenting the results, YOU MUST RANK THEM (1지망, 2지망, 3지망).
For each recommendation, you MUST provide a specific REASON why it's a good fit.
Step 4 - NEXT STEP UPSELL: After recommending the main treatment, you MUST act as a true consultant and suggest one complementary "next step" treatment.

SPECIAL FLOW - FULL-DAY PACKAGE ITINERARY:
If the user indicates they have a FULL DAY available ("하루종일", "풀타임") or a HIGH BUDGET ("1000만원", "플렉스"), DO NOT just list single shops. Instead, you MUST design a structured sequence of 3 different treatments as a "Beauty Day Package".
HOW TO FORMAT PACKAGES:
[✨ VIP 뷰티 데이 패키지 1]
- 10:00~12:00 A 피부과 (인모드 리프팅) - 약 300만원
- 13:00~16:00 B 에스테틱 (무결점 진정/수분케어) - 약 500만원
- 16:00~19:00 C 두피관리센터 (VIP 헤드스파 & 두피마사지) - 약 200만원
(You must call 'search_shops' multiple times with different categories like '피부과', '에스테틱', '두피관리' or '헤어살롱' to build this real schedule using real shop names returned by the tool).

MEDICAL KNOWLEDGE:
- 여드름: 피지 과다 분비와 모공 막힘이 원인. 살리실산 필링, PDT, 레이저 토닝 추천. (병행 추천: 수분관리, 진정 에스테틱)
- 색소침착/기미: 멜라닌 과생성. 피코레이저, 레이저 토닝 추천. (병행 추천: 비타민C 이온토)
- 주름/탄력: 콜라겐 감소. 써마지 FLX, 울쎄라, 인모드 추천. (병행 추천: 에스테틱 진정관리, 스킨보톡스)
- 피로회복/힐링: 전신 아로마 마사지, VIP 헤드스파(두피관리), 프리미엄 헤어살롱 클리닉 추천.

CRITICAL RULES:
1. MAXIMAL VISUAL, EXTREME MINIMAL TEXT: The user finds text messy and hard to read. DO NOT write explanations or reasons in the text body. 
2. Just say exactly ONE SHORT SENTENCE like "고객님께 딱 맞는 매장 3곳을 찾았습니다! 👇" and STOP. Let the UI cards do 100% of the talking.
3. ABSOLUTELY NO MARKDOWN: No asterisks(**), no hashtags(#), no markdown image syntax. Plain Korean text only.
4. For Full-Day packages, provide only a 1-line summary. NO LONG EXPLANATIONS whatsoever.`;

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
        // 도구 호출 후 AI가 결과를 기반으로 텍스트 응답을 생성하도록 허용 (최대 3단계)
        maxSteps: 3,
        tools: {
            search_shops: tool({
                description: 'Search for beauty shops, clinics, or salons based on user criteria like region, category, or treatment.',
                parameters: z.object({
                    region: z.string().optional().describe('Region or city name: 서울(강남, 홍대, 명동, 압구정, 신사, 이태원, 잠실, 성수, 건대, 신촌, 여의도, 종로, 합정, 을지로, 사당, 노원, 목동, 청담), 경기(판교, 분당, 수원, 일산, 부천), 부산(서면, 해운대, 남포동, 센텀시티), 대구(동성로, 수성구), 인천(구월동, 부평), 대전(둔산동), 광주(충장로), 제주(제주시). Leave empty if none specified.'),
                    category: z.string().optional().describe('Type of shop: 피부과(Dermatology), 헤어살롱(Hair Salon), 메이크업(Makeup), 에스테틱(Esthetic), 성형외과(Plastic Surgery), 네일아트(Nail Art), 왁싱(Waxing), 반영구(Semi-permanent Tattoo), 두피관리(Scalp Care)'),
                    max_price: z.number().optional().describe('Maximum budget in Korean Won (KRW).'),
                    query: z.string().optional().describe('Specific treatment name (e.g. Inmode, Thermage). DO NOT pass abstract benefits (e.g. tone, skin texture) as a query.'),
                }),
                execute: async ({ region, category, max_price, query }: { region?: string, category?: string, max_price?: number, query?: string }) => {
                    console.log(`[Tool Call] search_shops:`, { region, category, max_price, query });
                    const results = await shopApi.searchShops({
                        region,
                        category,
                        maxPrice: max_price,
                        query
                    });
                    // Return top 3 matches strictly to keep the UI clean and concise
                    return results.slice(0, 3).map(shop => ({
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

    return result.toDataStreamResponse();
}
