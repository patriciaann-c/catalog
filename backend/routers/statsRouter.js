import { Router } from 'express';
import { client } from '../prisma-client.js';

const router = Router();

router.get('/', async (req, res) => {
    const stats = await client.product.aggregate({
        _avg: { price: true },
        _max: { price: true },
        _min: { price: true },
        _count: true
    });

    const groups = await client.productCategory.groupBy({
        by: ['categoryId'],
        _count: { _all: true }
    });

    const categories = await client.category.findMany({ select: { id: true, name: true } });

    res.json({
        success: true,
        message: '',
        data: {
            averagePrice: stats._avg.price?.toString(),
            highestPrice: stats._max.price?.toString(),
            lowestPrice: stats._min.price?.toString(),
            total: stats._count,
            productsByCategory: groups.map((group) => ({
                category: categories.find((c) => c.id === group.categoryId)?.name,
                products: group._count._all
            }))
        }
    });
});
export default router;
