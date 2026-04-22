import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
const router=express.Router();

//Register
router.post('/register',async(req,res)=>{
    const {username,email,password,avator,role,phone}=req.body;
    try{
    if(!username ||!email||!password){
        return res.status(400).json({message:"Please fill all required information"});
    }
    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User already exists"});
    }

    const user=await User.create({username,email,password,phone,avator,role});
    const token = generateToken(user._id);
    res.status(201).json({
       id:user._id,
       role:user.role,
       avator:user.avator,
       username:user.username,
       email:user.email,
       phone:user.phone,
       token
    })
}catch(err){
      console.log("ERROR:", err);
    res.status(500).json({message:"Server error"});
}
})

//login 
router.post('/login',async(req,res)=>{
    const {role,email,password}=req.body;
    try{
       if(!email ||!password){
        return res.status(400).json({message:"Fill all the  required information"})
       }
       const user=await User.findOne({email});
       if(!user||!(await user.matchPassword(password))){
        return res.status(401).json({message:"Enter a valid email and password"});
       }
       res.status(200).json({
       id:user._id,
       role:user.role,
       email:user.email,
       username:user.username,
       token: generateToken(user._id) 
       });
    }
catch(err){
    console.log(err);   // VERY IMPORTANT
    res.status(500).json({message:"Server error"});
}
})

//to store the information of myself
router.get('/me',protect ,async(req,res)=>{
    res.status(200).json(req.user)
});

//generaating jwt token
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"30d"});
}
export default router;