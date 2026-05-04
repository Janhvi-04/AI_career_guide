import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})
function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success("Reset link sent to your email");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
        setLoading(false)
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-center mb-4'>Forgot Password</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
          <button disabled={loading} className='w-full bg-blue-600 text-white p-2 rounded-lg'>
            {loading?"Please wait...":"Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}