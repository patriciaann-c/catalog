import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Server running on port: ${PORT}`);
    }
})