import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from 'node-cron';
import { connectDB } from "./config/db.js";
import runCountrySeed from './scripts/fetchCountries.js'
import Country from "./models/Country.js";
import routes from './routes/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT;

// connect DB
connectDB();

if (NODE_ENV === "production") {
    cron.schedule("15 22 * * *", async () => {
        console.log("[Cron] Updating data from API...");
        await runCountrySeed();
        console.log("[Cron] Data refreshed successfully.");
    });
} else if (NODE_ENV === "development") {
    const count = await Country.countDocuments();
    if (count === 0) {
        console.log("No countries found. Seeding initial data...");
        await runCountrySeed();
        console.log("Seeding done!");
    } else {
        console.log(`DB already has ${count} countries — skip seeding.`);
    }
}

app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
})