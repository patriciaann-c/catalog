import { client } from '../prisma-client.js';
import products from '../data/db-store-completed.js';

const data = products.map(({ name, description, price, image }) => ({
    name,
    description,
    price,
    image
}));

await client.product.deleteMany();
await client.category.deleteMany();

const result = await client.product.createMany({ data });
console.log(`Entered ${result.count} products`);

const categoryNames = ['Elettronic', 'House', 'Sport', 'Accessory'];
await client.category.createMany({
    data: categoryNames.map((name) => ({ name }))
});

async function pickRandomCategoryIds(count) {
    const categories = await client.category.findMany({ select: { id: true } });
    return categories
        .map((category) => category.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

const savedProducts = await client.product.findMany({ select: { id: true } });
const categoryCount = await client.category.count();
const links = [];

for (const product of savedProducts) {
    const attachedCategoryCount = Math.floor(Math.random() * (categoryCount + 1));
    const categoryIds = await pickRandomCategoryIds(attachedCategoryCount);
    for (const categoryId of categoryIds) {
        links.push({ productId: product.id, categoryId });
    }
}

await client.productCategory.createMany({ data: links });
console.log(`Entered ${categoryCount} categories and ${links.length} links`);

await client.$disconnect();