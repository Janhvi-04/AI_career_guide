import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
const router=express.Router();
router.post("/signup",async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        const userExists=await User.findOne({email});
        if(userExists) {
            return res.status(400).json({message:"User already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({
            name,
            email,
            password: hashedPassword
        })
        await user.save();
        res.status(201).json({message:"Signup successful"})
    } catch (err) {
        res.status(500).json({message:"Server error"})
    }
})
router.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user) {
            return res.status(400).json({message:"User does not exist"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token=jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        )
        res.json({
            message:"Login successful",token
        })
    } catch (err) {
        res.status(500).json({message:"Server error"})
    }
})
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15min
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"CareerGuide AI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click to reset password:</p>
             <a href="${resetLink}">${resetLink}</a>`
    });
    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.log("LOGIN ERROR:", err); 
    res.status(500).json({ message: "Server error" });
  }
});
export default router;