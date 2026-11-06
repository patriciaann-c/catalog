import { Router } from "express";
import products from "../data/db-store-completed.js";
import { client } from "../prisma-client.js";

const router = Router();

router.get('/', async (req, res) => {
    const products = await client.product.findMany({ orderBy: { id: 'asc' } });

    res.json({ success: true, message: '', data: products });
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


router.post('/', async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Name and price required',
            data: null
        });
    }

    const product = await client.product.create({
        data: { name, description: description ?? '', price }
    });

    res.status(201).json({
        success: true,
        message: 'Product created',
        data: product
    });
});

router.put('/:id', async (req, res) => {
    const { name, description, price } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Name and price required',
            data: null
        });
    }
    try {
        const product = await client.product.update({
            where: { id: Number(req.params.id) },
            data: { name, description: description ?? '', price }
        });
        res.json({ success: true, message: 'Product updated', data: product });
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