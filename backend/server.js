import express from "express";
import productsRouter from "./routers/productsRouter.js";
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use('/products', productsRouter);

app.listen(PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Server running on port: ${PORT}`);
    }
})