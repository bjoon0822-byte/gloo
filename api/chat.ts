import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { shopApi } from '../src/services/api/shops';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

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
                description: 'Search for beauty shops, clinics, or salons based on user criteria like region, category, or treatment.',
                parameters: z.object({
                    region: z.string().optional().describe('The area in Seoul, e.g., Gangnam, Hongdae, Myeongdong. Leave empty if none specified.'),
                    category: z.string().optional().describe('Type of shop: 피부과(Dermatology), 헤어살롱(Hair Salon), 메이크업(Makeup), 에스테틱(Esthetic), 성형외과(Plastic Surgery)'),
                    max_price: z.number().optional().describe('Maximum budget in Korean Won (KRW).'),
                    query: z.string().optional().describe('General search term or specific treatment name.'),
                }),
                execute: async ({ region, category, max_price, query }) => {
                    console.log(`[Tool Call] search_shops:`, { region, category, max_price, query });
                    const results = await shopApi.searchShops({
                        region,
                        category,
                        maxPrice: max_price,
                        query
                    });
                    // Return top 3 matches to keep the context window small
                    return results.slice(0, 3).map(shop => ({
                        name: shop.name,
                        region: shop.region,
                        category: shop.category,
                        rating: shop.rating,
                        languages: shop.languages.join(", "),
                        top_treatments: shop.treatments.slice(0, 2).map(t => `${t.name}: ₩${t.price}`),
                        base_price: shop.base_price
                    }));
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
