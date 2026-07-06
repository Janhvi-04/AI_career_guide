import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/skill-gap')({
  component: SkillGap,
})

function SkillGap() {
  const [targetRole,setTargetRole]=useState("");
  const [currentSkills,setCurrentSkills]=useState("");
  const [analysis,setAnalysis]=useState(null);
  const [loading,setLoading]=useState(false);
  const [errorMessage,setErrorMessage]=useState("");

  const handleAnalysis=async(e)=>{
    e.preventDefault()
    const roleInput = targetRole ? String(targetRole).trim() : "";
    const skillsInput = currentSkills ? String(currentSkills).trim() : "";
    if(!roleInput || !skillsInput) {
      setErrorMessage("Please fill both target role and current skills.")
      return
    }
    setLoading(true)
    setErrorMessage("")
    setAnalysis(null)
    const BASE_URL=import.meta.env.VITE_BACKEND_URL;
    try{
      const response=await fetch(`${BASE_URL}/skill-gap`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({targetRole,currentSkills}),
      })
      const data=await response.json()
      if(data.success) {
        setAnalysis(data.data)
      } else {
        setErrorMessage(data.message || "Failed to process skills audit.")
      }
    } catch(error) {
      console.error(error)
      setErrorMessage("Could not connect to backend gateway. Verify terminal logs.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='min-h-screen bg-slate-50 p-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100'>
          <h1 className='text-3xl font-bold text-slate-900'>Placement Skill-Gap Auditor</h1>
          <p className='mt-2 text-slate-600'>Audit your technical readiness against target profiles to isolate exactly what to learn next.</p>
          <form onSubmit={handleAnalysis} className='mt-6 space-y-4'>
            <div>
              <label className='mb-2 block font-medium text-sm text-slate-700'>What is your Traget Job Role?</label>
              <input type="text"
              placeholder='e.g. Full-Stack Web Developer, Security Engineer, DevOps Expert'
              value={targetRole}
              onChange={(e)=> setTargetRole(e.target.value)}
              className='w-full h-12 rounded-2xl border boorder-slate-200 px-4 outline-none focus:border-indigo-500 text-sm' />
            </div>
            <div>
              <label className='mb-2 block font-medium text-sm text-slate-700'>What skills do you already know?</label>
              <textarea value={currentSkills}
              placeholder='e.g. HTML, Bootstrap, PyTorch (Separate skills with commas)'
              onChange={(e)=>setCurrentSkills(e.target.value)}
              className='w-full min-h-[100px] rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 text-sm resize-none'/>
            </div>
            <button type='submit' disabled={loading} className='w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition'>
              {loading?"Auditing Profile Against Core Benchmarks...":"Run Skill Gap Analysis"}
            </button>
          </form>
        </div>
        {errorMessage && (
          <div className='rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm'>
            <strong>System Notice:</strong>{errorMessage}
          </div>
        )}
        {analysis && (
          <div className='space-y-6'>
            <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100'>
              <span className='text-xs font-bold text-indigo-600 uppercase tracking-wider'>Placement Readiness Scorecard</span>
              <h2 className='text-2xl font-bold text-slate-900 mt-1'>AI Placement Verdict</h2>
              <p className='mt-3 text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100'>{analysis.verdict}</p>
            </div>
            <div className='grid grid-cols-1 gap-6'>
              <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-1'>
                <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  Verified Strengths
                </h3>
                {analysis.matchingSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No exact target matches identified yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchingSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-green-50 text-green-700 font-semibold rounded-xl text-xs border border-green-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-2 space-y-4'>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Identified Priority Knowledge Gaps
                </h3>
                <div className='space-y-3'>
                  {analysis.missingSkills.map((gap, index) => (
                    <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">{gap.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{gap.whyItMatters}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border tracking-wider self-start sm:self-auto shrink-0 ${
                        gap.priority.toLowerCase() === "high" ? "bg-red-50 text-red-600 border-red-100" :
                        gap.priority.toLowerCase() === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {gap.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
