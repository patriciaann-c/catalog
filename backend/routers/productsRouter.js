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

export default router;