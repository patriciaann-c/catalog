import { Router } from "express";
import products from "../data/db-store-completed.js";
import { client } from "../prisma-client.js";
import checkProductId from '../middlewares/checkProductId.js';
import checkProductBody from '../middlewares/checkProductBody.js';

const router = Router();

router.get('/', async (req, res) => {
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit)) || 10));
    const search = String(req.query.search ?? '').trim();
    const where = search ? { name: { contains: search } } : {};
    const total = await client.product.count({ where });
    const products = await client.product.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit
    });
    res.json({
        success: true,
        message: '',
        data: products,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        }
    });
});

router.get('/:id', async (req, res) => {
    const product = await client.product.findUnique({
        where: { id: Number(req.params.id) }
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
            data: null
        });
    }

    res.json({ success: true, message: '', data: product });
});


router.post('/', checkProductBody, async (req, res) => {
    const { name, description, price, image } = req.sanitizedData;

    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Name and price required',
            data: null
        });
    }

    const product = await client.product.create({
        data: { name, description: description ?? '', price, image }
    });

    res.status(201).json({
        success: true,
        message: 'Product created',
        data: product
    });
});

router.put('/:id', checkProductId, checkProductBody, async (req, res) => {
    const { name, description, price, image } = req.sanitizedData;
    try {
        const product = await client.product.update({
            where: { id: Number(req.params.id) },
            data: { name, description, price, image }
        });
        res.json({ success: true, message: 'Prodotto aggiornato', data: product });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Prodotto non trovato',
                data: null
            });
        }
        throw err;
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await client.product.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ success: true, message: 'Product deleted', data: product });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                data: null
            });
        }
        throw err;
    }
});

export default router;