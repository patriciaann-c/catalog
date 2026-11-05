import { Router } from "express";
import products from "../data/db-store-completed.js";

const router = Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '',
        data: products
    })
});

router.post('/', (req, res) => {
    const { name, description, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Name and price required',
            data: null
        });
    }

    const newProduct = { id: products.length + 1, name, description, price };
    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: 'Product created',
        data: newProduct
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((item) => item.id === id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
            data: null
        });
    }

    res.json({
        success: true,
        message: '',
        data: product
    });
});

export default router;