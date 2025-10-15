import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
})