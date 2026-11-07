import { tool } from 'langchain';
import { z } from 'zod';
import { client } from '../prisma-client.js';
const searchProductsSchema = z.object({
    query: z.string().min(2).describe('Text to search for product names or descriptions')
});
async function searchProductsFunction({ query }) {
    const products = await client.product.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } }
            ]
        },
        select: { id: true, name: true, description: true, price: true },
        take: 10
    });
    if (products.length === 0) {
        return 'Product not found';
    }
    return JSON.stringify(products);
}
const searchProducts = tool(searchProductsFunction, {
    name: 'search_products',
    description: 'Search products of the store for text, in the name and description. Return with a maximum of 10 products with id, name, description and price.',
    schema: searchProductsSchema
});
export default searchProducts;