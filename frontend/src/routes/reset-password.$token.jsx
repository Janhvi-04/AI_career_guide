import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react';
import toast from 'react-hot-toast';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute('/reset-password/$token')({
  component: ResetPassword,
})

function ResetPassword() {
    const {token}=Route.useParams();
    const navigate=useNavigate();
    const [form,setForm]=useState({password:"",confirmPassword:""});
    const [loading,setLoading]=useState(false);
    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value})
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res=await fetch(`${BASE_URL}/auth/reset-password/${token}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({password:form.password})
            })
            const data=await res.json();
            if(!res.ok) {
                toast.error(data.message);
            } else {
                toast.success("Password reset successful");
                navigate({to:"/login"})
            }
        } catch (err) {
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-center mb-2'>Reset Password</h2>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Enter your new password
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type="password"
            required
            name="password"
            placeholder="New Password"
            onChange={handleChange}
            className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
           <input
            type="password"
            required
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
          <button
            disabled={loading}
            className='w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition'
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
