
import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoutes from "./routes/UserRoutes.js";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully",
  });
});

// User routes
app.use("/user", userRoutes);

// Keep your existing port unless you intentionally changed it
const PORT = process.env.PORT || 3000;

// Connect database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
