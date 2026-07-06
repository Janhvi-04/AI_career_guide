import { createFileRoute,Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/roadmap')({
  component: Roadmap,
})

function Roadmap() {
  const [targetGoal,setTargetGoal]=useState("");
  const [timeframe,setTimeframe]=useState("");
  const [roadmapData,setRoadmapData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [errorMessage,setErrorMessage]=useState("");

  const handleGenerateRoadmap=async(e)=>{
    e.preventDefault()
    if(!targetGoal.trim()) {
      setErrorMessage("Please enter a target goal or technology stack.");
      return
    }
    setLoading(true)
    setErrorMessage("")
    setRoadmapData(null)
    const BASE_URL=import.meta.env.VITE_BACKEND_URL
    try {
      const response=await fetch(`${BASE_URL}/roadmap`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({targetGoal,timeframe}),
      })
      const data=await response.json()
      if(data.success) {
        setRoadmapData(data.data)
      } else {
        setErrorMessage(data.message || "Failed to compile your learning roadmap.")
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Could not communicate with backend. Please check your console/terminal logs.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='min-h-screen bg-slate-50 p-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link to="/dashboard" className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition group'>
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100'>
          <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>Custom Roadmap</h1>
          <p className='mt-2 text-slate-500 text-sm'>Map out dynamic, chronological milestones with actionable micro-projects for any path.</p>
          
          <form onSubmit={handleGenerateRoadmap} className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium text-sm text-slate-700">What's your target role?</label>
              <input
                type="text"
                placeholder="e.g. Data engineer, Scientist, AI analyst"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-sm text-slate-700">Target Duration (Optional)</label>
              <input
                type="text"
                placeholder="e.g., 4 weeks, 3 months"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition shadow-sm h-12 flex items-center justify-center text-sm"
            >
              {loading ? "Slicing Milestones & Projects..." : "Generate Master Roadmap"}
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className='rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm font-medium'>
            <strong>System Notice:</strong> {errorMessage}
          </div>
        )}

        {/* TIMELINE DISPLAY AREA */}
        {roadmapData && (
          <div className='space-y-8 mt-4'>
            <div className='bg-[#004F98] p-8 rounded-3xl text-white shadow-sm'>
              <span className='inline-block text-[10px] font-extrabold uppercase bg-indigo-600/20 text-indigo-300 border border-indigo-500/3xl px-3 py-1 rounded-full tracking-wider mb-3'>
                Total Estimated Commitment: {roadmapData.estimatedTotalWeeks || "Flexible"}
              </span>
              <h3 className='text-2xl sm:text-3xl font-extrabold text-white tracking-tight'>{roadmapData.title}</h3>
            </div>
            <div className='relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8'>
              {roadmapData.milestones?.map((phase, index) => (
                <div key={index} className='relative'>
                  <span className="absolute -left-[45px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-4 ring-slate-50 shadow-sm">
                    {phase.phaseNumber}
                  </span>
                  <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5 hover:border-slate-200 transition-all duration-200'>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{phase.phaseTitle}</h3>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 self-start sm:self-auto">
                        {phase.duration}
                      </span>
                    </div>
                    <div>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-3'>Core Competencies to Build:</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.topicsToMaster?.map((topic, tIdx) => (
                          <span key={tIdx} className="px-3 py-2 bg-slate-50 text-slate-700 font-medium rounded-xl text-xs border border-slate-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className='p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start'>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className='text-xs font-bold uppercase tracking-wider text-slate-800'>Phase Capstone Milestone Project</h4>
                        <p className='text-slate-600 text-sm leading-relaxed font-normal mt-1'>{phase.practicalProject}</p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
