import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
const BASE_URL=import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute('/login')({
  component: Login,
})
function Login() {
    const navigate=useNavigate();
    const [form,setForm]=useState({
        email:"",
        password:""
    });
    const handleChange=(e)=>{
        const {name,value}=e.target;
        setForm({...form,[name]:value})
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message);
            } else {
                toast.success("Login successful")
                localStorage.setItem("token", data.token);
                navigate({to:"/dashboard"})
            }
        } catch (err) {
            toast.error("Server error");
        }
    }
  return (
    <>
    <div className="absolute top-6 left-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                <ArrowLeft className="h-6 w-6" />
            </Link>
    </div>
    <div>
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
            <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
                <h2 className='text-2xl font-bold text-center mb-2'>Welcome Back</h2>
                <p className='text-sm text-gray-500 text-center mb-6'>Login to continue your career journey</p>
                <form className='space-y-4' onSubmit={handleSubmit}>
                    <div>
                        <label className='text-sm font-medium'>Email</label>
                        <input type="email" name='email' onChange={handleChange}
                        placeholder='Enter your email' required
                        className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
                    </div>
                    <div>
                        <label className='text-sm font-medium'>Password</label>
                        <input type="password" name='password' onChange={handleChange}
                        placeholder='Enter your password' required
                        className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'/>
                    </div>
                    <div className='text-right'>
                        <Link to='/forgot-password' className='text-sm text-blue-500 hover:underline'>Forgot Password?</Link>
                    </div>
                    <button type='submit' className='w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition'>Login</button>
                </form>
                <p className='text-sm text-center mt-6'>Don't have an account?{" "}
                    <a href="/signup" className='text-blue-600 font-medium hover:underline'>Sign up</a>
                </p>
            </div>
        </div>
    </div>
    </>
  );
}
