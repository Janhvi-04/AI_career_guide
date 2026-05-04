import { createFileRoute } from '@tanstack/react-router'
import { Link,useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
const BASE_URL=import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute('/signup')({
  component: Signup,
})

function Signup() {
  const navigate=useNavigate();
  const[form,setForm]=useState({
    name:'',
    email:'',
    password:'',
    confirmPassword:''
  })
  const [errors,setErrors]=useState({});
  const [strength,setStrength]=useState("");
  const nameRegex=/^[A-Za-z ]{3,}$/
  const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const handleChange=(e)=>{
    const {name,value}=e.target
    if(name==="name") {
      if(!/^[A-Za-z ]*$/.test(value)) return
    }
    setForm({...form,[name]:value})
    if(name==="password") {
      checkPasswordStrength(value)
    }
  }
  const checkPasswordStrength=(password)=>{
    if(password.length<6) setStrength("Weak")
    else if(/[A-Z]/.test(password) && /[0-9]/.test(password) && /[@$!%*?&]/.test(password)) setStrength("Strong")
    else setStrength("Medium")
  }
  const validate=()=>{
    let newErrors={}
    if(!nameRegex.test(form.name)) {
      newErrors.name="Name should contain only letters (min 3 chars)"
    }
    if(!emailRegex.test(form.email)) {
      newErrors.email="Enter a valid email"
    }
    if(form.password.length<6) {
      newErrors.password="Password must be atleast 6 characters"
    }
    if(form.password!=form.confirmPassword) {
      newErrors.confirmPassword="Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length===0
  }
  const handleSubmit=async(e)=>{
    e.preventDefault()
    if(!validate()) {
      toast.error("Please fix the errors");
      return;
    }
    try {
      const res=await fetch(`${BASE_URL}/auth/signup`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:form.name,email:form.email,password:form.password})
      })
      const data=await res.json()
      if(!res.ok) {
        toast.error(data.message);
      } else {
        toast.success("Signup sucessful")
        navigate({to:"/login"});
      }
    } catch (err) {
      toast.error("Server error")
    }
  }
  return (
    <>
    <div className="absolute top-6 left-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                <ArrowLeft className="h-6 w-6" />
            </Link>
    </div>
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-center mb-2'>Create Account</h2>
        <p className='text-sm text-gray-500 text-center mb-6'>Start your career journey with us</p>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='text-sm font-medium'>Full Name</label>
            <input type="text" name='name' value={form.name} onChange={handleChange} placeholder='Enter your name' required className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          <div>
            <label className='text-sm font-medium'>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder='Enter your email' required className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          <div>
            <label className='text-sm font-medium'>Password</label>
            <input type="password" name='password' value={form.password} onChange={handleChange} placeholder='Create a password' required className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
            <p className={`text-xs mt-1 ${strength==="Strong"?"text-green-500":strength==="Medium"?"text-yellow-500":"text-red-500"}`}>Strength: {strength}</p>
            {errors.password && <p className='text-red-500 text-xs'>{errors.password}</p>}
          </div>
          <div>
            <label className='text-sm font-medium'>Confirm Password</label>
            <input type="password" name='confirmPassword' value={form.confirmPassword} onChange={handleChange} placeholder='Confirm your password' required className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
          </div>
          <button type='submit' className='w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition'>Sign Up</button>
        </form>
        <p className='text-sm text-center mt-6'>Already have an account?{" "}
          <Link to='/login' className='text-blue-600 font-medium hover:underline'>Login</Link>
        </p>
      </div>
    </div>
    </>
  );
}
