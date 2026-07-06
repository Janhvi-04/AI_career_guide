import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    name:String,
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    role:{type:String,default:""},
    dob:{type:String,default:""},
    gender:{type:String,default:""},
    academicStatus:{type:String,default:""},
    projects:{type:[String],default:[]},
    skills:[{
        name:String,
        yours:Number,
        required:Number
    }]
},{timestamps:true});
export default mongoose.model("User",userSchema);