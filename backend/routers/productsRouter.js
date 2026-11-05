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

export default router;