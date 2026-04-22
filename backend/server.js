import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
dotenv.config();

const PORT=process.env.PORT||5000;
connectDB();    
const app=express();

app.use(cors());
app.use(express.json());
       
app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running in ${PORT}`);
})