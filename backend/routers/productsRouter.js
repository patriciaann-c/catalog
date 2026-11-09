import { Router } from "express";
import products from "../data/db-store-completed.js";
import { client } from "../prisma-client.js";
import checkProductId from '../middlewares/checkProductId.js';
import checkProductBody from '../middlewares/checkProductBody.js';

const router = Router();

function formatProduct(product) {
    return {
        ...product,
        categories: product.categories?.map((link) => link.category) ?? []
    };
}

router.get('/', async (req, res) => {
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit)) || 10));
    const search = (req.query.search || '').trim();

    let categoryId;
    if (req.query.category !== undefined) {
        categoryId = Number(req.query.category);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Category needs to be an integer and greater than 0',
                data: null
            });
        }
    }
    const where = search ? { name: { contains: search } } : {};

    if (categoryId !== undefined) {
        where.categories = { some: { categoryId } };
    }

    if (req.query.maxPrice !== undefined) {
        const maxPrice = Number(req.query.maxPrice);
        if (Number.isFinite(maxPrice) && maxPrice >= 0) {
            where.price = { lte: maxPrice };
        }
    }

    const total = await client.product.count({ where });

    const sortFields = ['id', 'name', 'price'];
    const sort = sortFields.includes(req.query.sort) ? req.query.sort : 'id';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const products = await client.product.findMany({
        where,
        include: {
            categories: {
                select: {
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sort]: order }
    });
    res.json({
        success: true,
        message: '',
        data: products.map(formatProduct),
        meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    });
});

router.get('/:id', checkProductId, async (req, res) => {
    const id = Number(req.params.id);
    const product = await client.product.findUnique({
        where: { id },
        include: {
            categories: {
                select: {
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
            data: null
        });
    }

    res.json({ success: true, message: '', data: formatProduct(product) });
});


router.post('/', checkProductBody, async (req, res) => {
    const { name, description, price, image, categoryIds } = req.sanitizedData;

    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Name and price required',
            data: null
        });
    }

    const product = await client.$transaction(async (tx) => {
        return await tx.product.create({
            data: {
                name,
                description: description ?? '',
                price,
                image,
                categories: categoryIds && categoryIds.length > 0 ? {
                    create: categoryIds.map((categoryId) => ({ categoryId }))
                } : undefined
            },
            include: {
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
    });

    res.status(201).json({
        success: true,
        message: 'Product created',
        data: formatProduct(product)
    });
});

router.put('/:id', checkProductId, checkProductBody, async (req, res) => {
    const id = Number(req.params.id);
    const { name, description, price, image, categoryIds } = req.sanitizedData;
    try {
        const product = await client.$transaction(async (tx) => {
            await tx.productCategory.deleteMany({
                where: { productId: id }
            });
            return await tx.product.update({
                where: { id },
                data: {
                    name,
                    description,
                    price,
                    image,
                    categories: categoryIds && categoryIds.length > 0 ? {
                        create: categoryIds.map((categoryId) => ({ categoryId }))
                    } : undefined
                },
                include: {
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
        });

        res.json({ success: true, message: 'Product updated', data: formatProduct(product) });
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

router.delete('/:id', checkProductId, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const product = await client.$transaction(async (tx) => {
            await tx.productCategory.deleteMany({
                where: { productId: id }
            });

            return await tx.product.delete({
                where: { id }
            });
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