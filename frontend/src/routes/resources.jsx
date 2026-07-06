import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute('/resources')({
  component: Resources,
})

function Resources() {
  const [topic,setTopic]=useState("");
  const [level,setLevel]=useState("Beginner");
  const [resources,setResources]=useState([]);
  const [loading,setLoading]=useState(false);
  const [errorMessage,setErrorMessage]=useState("");

  const fetchResources=async(e)=>{
    e.preventDefault();
    if(!topic.trim()) return;
    setLoading(true);
    setErrorMessage("");
    setResources([]);
    try {
      const response=await fetch(`${BASE_URL}/resources`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({topic,level})
      });
      const data=await response.json();
      if (data.success) {
        setResources(data.data);
      } else {
        setErrorMessage(data.message || "Something went wrong while sourcing links.");
      }
    } catch(error) {
      console.error(error);
      setErrorMessage("Failed to connect to the backend server. Please check if your terminal is running.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className='min-h-screen bg-slate-50 p-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100'>
          <h1 className='text-3xl font-bold text-slate-900'>AI Learning Engine</h1>
          <p className='mt-2 text-slate-600'>Enter any technical topic to instantly pull verified tutorials and documentation guides.</p>
          <form onSubmit={fetchResources} className='mt-6 space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4 items-end'>
              <div className='flex-1 w-full'>
                <label className='mb-2 block font-medium txet-sm text-slate-700'>What do you want to learn?</label>
                <input type="text"
                placeholder='e.g., Cryptography, MongoDB Aggregations, React Hooks'
                value={topic}
                onChange={(e)=>setTopic(e.target.value)}
                className='w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-indigo-500 text-sm' />
              </div>
              <div className='md:col-span-1'>
                <label className='mb-2 block font-medium text-sm text-slate-700'></label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 outline-none bg-white focus:border-indigo-500 text-sm h-[46px]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <button type='submit' disabled={loading} className='w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition'>
              {loading?"Sourcing Educational Material...":"Generate Resources"}
            </button>
          </form>
        </div>
        {errorMessage && (
          <div className='rounded-2xl bg-red-50 p-4 text-red-600 border border-red100 text-sm'>
            <strong>Configuration Note:</strong>{errorMessage}
          </div>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {resources.map((res,index)=>{
            // Compile clean web queries pointing safely to their target platforms
            let searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(res.searchQuery)}`;
            if (res.platform.toLowerCase() === "geeksforgeeks") {
              searchUrl = `https://www.google.com/search?q=${encodeURIComponent(res.searchQuery + " site:geeksforgeeks.org")}`;
            } else if (res.platform.toLowerCase() === "w3schools") {
              searchUrl = `https://www.google.com/search?q=${encodeURIComponent(res.searchQuery + " site:w3schools.com")}`;
            }
            return (
              <a
              key={index}
              href={searchUrl}
              target="_blank"
              rel='noopenar noreferrer'
              className='group p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-48'>
                <div>
                  <div className='flex itmes-center justify-between mb-3'>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold tracking-wide border uppercase ${
                      res.platform.toLowerCase()==="youtube"?"bg-red-50 text-red-600 border-red-100":
                      res.platform.toLowerCase()==="geeksforgeeks"?"bg-green-50 text-green-700 border-green-100":
                      "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>{res.platform}</span>
                    <span className='text-xs text-slate-400 font-medium'>{res.contentType}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base line-clamp-2 group-hover:text-indigo-600">
                    {res.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{res.description}</p>
                </div>
                <div className='flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors mt-4'>
                  <span>Open Resource</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
