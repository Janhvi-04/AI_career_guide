import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.get("/",(req,res)=>{
    res.send("API is running...");
})
mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("MongoDB connected"))
    .catch((err)=>console.log(err))
app.listen(5000,()=>{
    console.log("Server running on port 5000")
})