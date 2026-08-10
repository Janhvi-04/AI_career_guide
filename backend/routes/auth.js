import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import dns from "dns";
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
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )
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
            message:"Login successful",token,
            user:{name:user.name,email:user.email},
            user_profile: {
                role: user.role || "",
                dob: user.dob || "",
                gender: user.gender || "Female",
                academicStatus: user.academicStatus || "",
                projects: user.projects || [],
                skills: user.skills || []
            }
        })
    } catch (err) {
        res.status(500).json({message:"Server error"})
    }
})
router.put("/update-profile", async (req, res) => {
    try {
        const { email, role, dob, gender, academicStatus, projects, skills } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { role, dob, gender, academicStatus, projects, skills },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User context not found" });
        }
        res.json({
            message: "Profile saved to database successfully",
            user_profile: {
                role: updatedUser.role,
                dob: updatedUser.dob,
                gender: updatedUser.gender,
                academicStatus: updatedUser.academicStatus,
                projects: updatedUser.projects,
                skills: updatedUser.skills
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Database update error" });
    }
});
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
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CareerGuide AI", email: "janvi042005@gmail.com" }, // Your verified Gmail
        to: [{ email: user.email }], 
        subject: "Password Reset",
        htmlContent: `<p>Click to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
      }),
    });
    const data=await response.json();
    if (!response.ok) {
      console.error("BREVO ERROR:", data);
      return res.status(500).json({ message: data.message || "Email sending failed" });
    }
    return res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.log("LOGIN ERROR:", err); 
    return res.status(500).json({ message: "Server error" });
  }
});
export default router;