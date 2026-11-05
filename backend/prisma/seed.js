import { client } from '../prisma-client.js';
import products from '../data/db-store-completed.js';

const data = products.map(({ name, description, price, image }) => ({
    name,
    description,
    price,
    image
}));

await client.product.deleteMany();
const result = await client.product.createMany({ data });

console.log(`Entered ${result.count} products`);
await client.$disconnect();