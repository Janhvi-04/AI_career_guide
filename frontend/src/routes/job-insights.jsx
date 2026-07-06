import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend
} from 'recharts'
export const Route = createFileRoute('/job-insights')({
  component: MarketInsights,
})
function MarketInsights() {
  const [targetRole, setTargetRole] = useState("")
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const handleFetchInsights = async (e) => {
    e.preventDefault()
    if (!targetRole.trim()) {
      setErrorMessage("Please type a role to check trends.")
      return
    }
    setLoading(true)
    setErrorMessage("")
    setInsights(null)
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL
      const response = await fetch(`${BASE_URL}/job-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole })
      })
      const data = await response.json()
      if (data.success && data.data) {
        setInsights(data.data)
      } else {
        setErrorMessage(data.message || "Failed to load market indicators.")
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Network error occurred pulling dashboard statistics.")
    } finally {
      setLoading(false)
    }
  }
  const getSectorPieData = () => {
    if (!insights) return []
    const score = insights.marketDemandScore || 75
    return [
      { name: 'Enterprise & SaaS', value: Math.round(score * 0.45), fill: '#4f46e5' },
      { name: 'Fintech & Banking', value: Math.round(score * 0.30), fill: '#06b6d4' },
      { name: 'Healthtech & AI Labs', value: Math.round(score * 0.15), fill: '#10b981' },
      { name: 'Early-stage Startups', value: Math.max(10, 100 - score), fill: '#94a3b8' }
    ]
  }
  const pieData = getSectorPieData()
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-6 font-sans antialiased'>
      <div className='mx-auto max-w-6xl space-y-6'>
        <Link to="/dashboard" className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition group'>
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/20'>
          <h1 className='text-3xl font-black text-slate-900 tracking-tight'>Market Analytics Radar</h1>
          <p className='mt-1.5 text-slate-500 text-xs max-w-xl leading-relaxed'>Generate mathematical charts mapping structural sector sizing and true technology saturation trends dynamically.</p>         
          <form onSubmit={handleFetchInsights} className='mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl'>
            <input
              type="text"
              placeholder="e.g., Surgeon, MERN Stack Developer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 outline-none focus:border-indigo-600 focus:bg-white text-sm text-slate-900 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 h-12 font-bold text-white hover:bg-indigo-700 active:scale-[0.98] disabled:bg-indigo-400 transition tracking-wide text-xs uppercase shadow-md shadow-indigo-100"
            >
              {loading ? "Compiling Vectors..." : "Get Insights"}
            </button>
          </form>
        </div>
        {errorMessage && (
          <div className='rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 text-xs font-bold shadow-sm'>
            {errorMessage}
          </div>
        )}
        {insights && (
          <div className='space-y-6 animate-fadeIn'>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">YoY Growth Velocity</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">+{insights.growthRatePercentage}%</h3>
                </div>
                <div className="h-6 px-2 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[9px] text-emerald-600 font-bold uppercase tracking-wider">UP</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Hiring Concentration</span>
                  <h3 className="text-2xl font-black text-indigo-600 mt-1">{insights.demandLevel}</h3>
                </div>
                <div className="h-6 px-2 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] text-indigo-600 font-bold uppercase tracking-wider">Active</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Hub Cluster</span>
                  <h3 className="text-sm font-black text-slate-800 mt-1.5 leading-tight">
                    {insights.topHiringLocations && insights.topHiringLocations.length > 0 
                      ? insights.topHiringLocations.join(', ') 
                      : "Remote"}
                  </h3>
                </div>
                <div className="h-6 px-2 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold uppercase tracking-wider">Zone</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold uppercase rounded border border-slate-200">Market share</span>
                  <h4 className="text-base font-black text-slate-900 mt-2">Sector Domain Distribution</h4>
                </div>
                <div className="h-60 w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-medium text-slate-500 w-full px-2 mt-2">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }}></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold uppercase rounded border border-slate-200">Tech Stack Shares</span>
                  <h4 className="text-base font-black text-slate-900 mt-2">Core Tool Prevalence</h4>
                </div>
                <div className="space-y-4 pt-6">
                  {insights.trendingSkills?.map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 block pr-4 leading-tight">{skill.skillName}</span>
                        <span className="font-mono text-slate-400 text-[11px] font-bold shrink-0">{skill.demandPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${skill.demandPercentage}%`,
                            backgroundColor: index === 0 ? '#4f46e5' : '#06b6d4',
                            opacity: 1 - index * 0.12 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 font-bold uppercase rounded border border-slate-200">Financial Metrics</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Compensation Spectrum Benchmarks</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Experience Track</th>
                      <th className="py-3 px-6">Market Bracket Value</th>
                      <th className="py-3 px-6 hidden sm:table-cell">Visual Scale Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">Early Career Bracket</td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-600">{insights.salaryRanges?.entryLevel}</td>
                      <td className="py-4 px-6 hidden sm:table-cell w-1/2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-400 h-full w-[35%] rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors bg-indigo-50/10">
                      <td className="py-4 px-6 font-semibold text-indigo-900">Median Specialist Target</td>
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{insights.salaryRanges?.midLevel}</td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full w-[65%] rounded-full"></div>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-emerald-900">Senior Authority</td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-600">{insights.salaryRanges?.seniorLevel}</td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[95%] rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}