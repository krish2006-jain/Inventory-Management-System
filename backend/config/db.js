import { Console } from "console";
import mongoose  from "mongoose";

export const connectDB=async()=>{
  try{
    const conn=await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");
  }
  catch(err){
    console.log(`Something went wrong ${err}`);
    process.exit(1);
  }
}