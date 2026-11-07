import express from "express";
import productsRouter from "./routers/productsRouter.js";
import cors from 'cors';
import aiRouter from './routers/aiRouter.js';

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use('/products', productsRouter);
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