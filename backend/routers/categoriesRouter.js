import { Router } from 'express';
import { client } from '../prisma-client.js';

const router = Router();

router.get('/', async (req, res) => {

    const categories = await client.category.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            _count: { select: { products: true } }
        }
    });
    res.json({
        success: true,
        message: '',
        data: categories.map(({ id, name, _count }) => ({
            id,
            name,
            productsCount: _count.products
        }))
    });
});
export default router;