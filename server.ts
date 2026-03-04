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

const __dirname = dirname(fileURLToPath(import.meta.url));
const shopsData: any[] = JSON.parse(
    readFileSync(join(__dirname, 'src', 'data', 'shops.json'), 'utf-8')
);

// 샵 검색 로직 (shopApi.searchShops 미러링)
function searchShops(filters: {
    query?: string;
    category?: string;
    region?: string;
    maxPrice?: number;
}): any[] {
    let results = [...shopsData];

    if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.treatments?.some((t: any) => t.name.toLowerCase().includes(q))
        );
    }
    if (filters.category) {
        results = results.filter((s) => s.category === filters.category);
    }
    if (filters.region) {
        const r = filters.region.toLowerCase();
        results = results.filter((s) =>
            s.region?.toLowerCase().includes(r) ||
            s.address?.toLowerCase().includes(r)
        );
    }
    if (filters.maxPrice) {
        results = results.filter((s) =>
            s.treatments?.some((t: any) => t.price <= filters.maxPrice!)
        );
    }
    results.sort((a, b) => b.rating - a.rating);
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
Reply in the language the user speaks. Use emojis naturally.`;

        const result = streamText({
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
                        const results = searchShops({ region, category, maxPrice: max_price, query });
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
