import { createAgent } from 'langchain';
import openrouterModel from '../models/openrouter.js';
import searchProducts from '../../tools/searchProducts.js';

let storeAgent = null;
export function getStoreAgent() {
    if (!storeAgent) {
        storeAgent = createAgent({
            model: openrouterModel,
            tools: [searchProducts],
            systemPrompt: `You're an assistant of My Store. Answer in english.
            For any question about the products, use the tool search_products.
            Don't invent products: if the tool doesn't say anything, just say it.`
        });
    }
    return storeAgent;
}