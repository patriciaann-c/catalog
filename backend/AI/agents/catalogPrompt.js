import { createAgent } from 'langchain';
import openrouterModel from '../models/openrouter.js';
import { client } from '../../prisma-client.js';

export default async function createCatalogPromptAgent() {
    const model = openrouterModel;
    const products = await client.product.findMany({
        select: { id: true, name: true, description: true, price: true },
        orderBy: { id: 'asc' }
    });

    const catalog = products
        .map((p) => `${p.id} | ${p.name} | ${p.price} € | ${p.description}`)
        .join('\n');
    return createAgent({
        model,
        tools: [],
        systemPrompt: `You're a sales assistant of My Store. Answer in english.
        Use ONLY the products of the catalog below. Inform if a prodcut doesn't exist
        CATALOG (id | name | prezzo | description):
        ${catalog}`
    });
}