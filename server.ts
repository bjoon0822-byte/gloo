/**
 * 로컬 개발용 API 서버
 * Vite 프록시를 통해 /api/chat 요청을 이 서버로 전달합니다.
 */
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 샵 검색 로직 (Supabase DB에서조회)
async function searchShops(filters: {
    query?: string;
    category?: string;
    region?: string;
    maxPrice?: number;
}) {
    let q = supabase.from('shops').select('*');

    if (filters.category) {
        q = q.eq('category', filters.category);
    }

    if (filters.region) {
        // Simple exact match or ilike for region
        q = q.ilike('region', `%${filters.region}%`);
    }

    if (filters.query) {
        // Search by shop name
        q = q.ilike('name', `%${filters.query}%`);
    }

    // Since we store treatments as JSONB we can't easily filter maxPrice in simple Supabase queries without RPC or complex GIN operators.
    // For now we will fetch then filter maxPrice locally, or just order by rating and let GPT understand.
    q = q.order('rating', { ascending: false }).limit(20);

    const { data, error } = await q;

    if (error) {
        console.error('Supabase fetch error:', error);
        return [];
    }

    let results = data || [];

    if (filters.maxPrice) {
        // Locally filter JSONB array of treatments for price
        results = results.filter((s: any) =>
            s.treatments?.some((t: any) => t.price <= filters.maxPrice!)
        );
    }

    return results;
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        const systemPrompt = `You are a professional K-Beauty Concierge for the 'GLOO' platform.
Your goal is to help foreigners find and book the best beauty shops (dermatology, hair salons, makeup, esthetics, plastic surgery) in Seoul.
Always be polite, enthusiastic, and highly professional.
When a user asks for recommendations, explicitly USE the 'search_shops' tool to find real places in the database. 
NEVER make up a shop name that does not exist in the database.
If 'search_shops' returns empty, apologize and say you couldn't find an exact match currently.
When a user expresses intent to book a specific shop (or asks to book a shop), YOU MUST ASK them for their preferred DATE and TIME. Do not book without confirming date and time.
Once the user provides the date and time, USE the 'confirm_booking' tool to finalize the booking.
Reply in the language the user speaks. Use emojis naturally.`;

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            messages,
            tools: {
                search_shops: tool({
                    description: 'Search for beauty shops, clinics, or salons based on user criteria.',
                    parameters: z.object({
                        region: z.string().optional().describe('Area in Seoul'),
                        category: z.string().optional().describe('Type: 피부과, 헤어살롱, 메이크업, 에스테틱, 성형외과'),
                        max_price: z.number().optional().describe('Max budget in KRW'),
                        query: z.string().optional().describe('Search term'),
                    }),
                    execute: async ({ region, category, max_price, query }: { region?: string; category?: string; max_price?: number; query?: string }) => {
                        console.log(`[Tool Call] search_shops:`, { region, category, max_price, query });
                        const results = await searchShops({ region, category, maxPrice: max_price, query });
                        return results.slice(0, 3).map((shop) => ({
                            name: shop.name,
                            region: shop.region,
                            category: shop.category,
                            rating: shop.rating,
                            languages: shop.languages?.join(', ') || 'Korean',
                            top_treatments: shop.treatments?.slice(0, 2).map((t: any) => `${t.name}: ₩${t.price}`) || [],
                            base_price: shop.base_price,
                        }));
                    },
                }),
                confirm_booking: tool({
                    description: 'Confirm a booking for a specific shop when the user has provided a date and time.',
                    parameters: z.object({
                        shop_name: z.string().describe('Name of the shop to book'),
                        date: z.string().describe('Date of the booking (e.g., 2024-05-20)'),
                        time: z.string().describe('Time of the booking (e.g., 14:30)'),
                    }),
                    execute: async ({ shop_name, date, time }) => {
                        console.log(`[Tool Call] confirm_booking:`, { shop_name, date, time });

                        const booking_id = `BKG-${Date.now()}`;

                        // DB 저장 (테이블이 없거나 권한 에러가 날 수 있으므로 예외 처리)
                        try {
                            const { error } = await supabase.from('bookings').insert({
                                booking_id,
                                shop_name,
                                date,
                                time,
                                status: 'confirmed'
                            });
                            if (error) console.error('Supabase DB Insert Error:', error.message);
                        } catch (e) {
                            console.error('Supabase DB Insert Exception:', e);
                        }

                        return {
                            success: true,
                            booking_id,
                            shop_name,
                            date,
                            time,
                            status: 'confirmed',
                            message: `Successfully booked ${shop_name} for ${date} at ${time}.`
                        };
                    },
                }),
            },
        });

        // 스트리밍 응답을 Express로 파이프
        const stream = result.textStream;
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
        });

        for await (const chunk of stream) {
            // AI SDK 스트리밍 프로토콜: 텍스트 청크를 "0:" 접두사로 전송
            res.write(`0:${JSON.stringify(chunk)}\n`);
        }
        res.end();
    } catch (error: any) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 GLOO API Server running at http://localhost:${PORT}`);
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing!'}`);
});
