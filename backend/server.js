import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(import.meta.dirname, '.env') });
dotenv.config();

import express from "express";
import productsRouter from "./routers/productsRouter.js";
import categoriesRouter from './routers/categoriesRouter.js';
import statsRouter from './routers/statsRouter.js';
import cors from 'cors';
import aiRouter from './routers/aiRouter.js';

const app = express();
const PORT = 3000;

// Allow Chrome's Private Network Access (PNA) for localhost dev
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (curl, Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    }
}));

app.use(express.json());

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/stats', statsRouter);
app.use('/ai', aiRouter);

app.use((err, req, res, next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) {
        console.error(err);
    }
    res.status(status).json({
        success: false,
        message: status >= 500 ? 'Error inside the server' : 'Request not valid',
        data: null
    });
});

app.listen(PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Server running on port: ${PORT}`);
    }
})