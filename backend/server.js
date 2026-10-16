import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoutes from "./routes/UserRoutes.js";
import cors from 'cors'
const app = express();
app.use(cors())
const PORT = process.env.PORT || 3000;

// Read JSON request body
app.use(express.json());

// User routes
app.use("/user", userRoutes);

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
};

startServer();