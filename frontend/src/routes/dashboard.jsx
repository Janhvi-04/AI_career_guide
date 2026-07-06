import { useEffect, useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  LayoutDashboard,
  User,
  Target,
  Map,
  BarChart2,
  BookOpen,
  FileSearch,
  Briefcase,
  Bot,
  Bell,
  Settings,
  Code2,
  ArrowRight,
  Wallet,
  Menu,
  LogOut,
  X,
  Sparkles,
  FileText,
} from 'lucide-react'
import CircularMatch from '../components/CircularMatch'
import { useRef } from 'react'
import { fetchProfileAnalysis,buildEnrichedProfile,needsFullProfileAnalysis } from '../lib/profileApi'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

const RESOURCE_COLORS = [
  { color: 'bg-indigo-600', tagStyle: 'bg-indigo-50 text-indigo-700' },
  { color: 'bg-emerald-600', tagStyle: 'bg-emerald-50 text-emerald-700' },
  { color: 'bg-sky-600', tagStyle: 'bg-sky-50 text-sky-700' },
]

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Target, label: 'Career Recommendation', path: '/recommendation' },
  { icon: Map, label: 'Roadmap', path: '/roadmap' },
  { icon: BarChart2, label: 'Skill Gap Analysis', path: '/skill-gap' },
  { icon: BookOpen, label: 'Resources', path: '/resources' },
  { icon: FileSearch, label: 'Resume Analyzer', path: '/resume-analyzer' },
  { icon: Briefcase, label: 'Job Market Insights', path: '/job-insights' },
  { icon: Bot, label: 'AI Career Advisor', path: '/advisor' },
]

function normalizeResources(items) {
  return items.slice(0, 3).map((r, idx) => ({
    title: r.title,
    platform: r.platform || 'Documentation',
    color: RESOURCE_COLORS[idx % RESOURCE_COLORS.length].color,
    tagStyle: RESOURCE_COLORS[idx % RESOURCE_COLORS.length].tagStyle,
  }))
}

function getBarColor(score) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [matchScore, setMatchScore] = useState(0)
  const [verdict, setVerdict] = useState('')
  const [skillsMatrix, setSkillsMatrix] = useState([])
  const [missingGaps, setMissingGaps] = useState([])
  const [jobInsights, setJobInsights] = useState(null)
  const [resources, setResources] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [dropdownOpen,setDropdownOpen]=useState(false)
  const dropdownRef=useRef(null)
  const router=useRouter()
  const [showConfirmLogout,setShowConfirmLogout]=useState(false)
  const applyProfileToDashboard = (profile) => {
    setRole(profile.role || '')
    setHasProfile(Boolean(profile.role?.trim() && profile.skills?.length))
    setVerdict(profile.verdict || '')
    setMatchScore(typeof profile.matchScore === 'number' ? profile.matchScore : 0)
    setSkillsMatrix(
      (profile.skills || []).map((s) => ({
        name: s.name,
        yours: Number(s.yours) || 0,
        required: Number(s.required) || 0,
      })),
    )
    setMissingGaps(profile.missingGaps || [])
    setJobInsights(profile.jobInsights || null)
    setResources(profile.curatedResources?.length ? normalizeResources(profile.curatedResources) : [])
  }

  const loadDashboardData = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    const storedProfile=localStorage.getItem("user_profile")
    let profile = storedProfile ? JSON.parse(storedProfile) : {
      role: '',
      skills: [],
      projects: [],
      academicStatus: '',
      gender: 'Female',
      dob: ''
    }
    if (!profile.role) {
      setHasProfile(false)
      return
    }
    setHasProfile(true)
    setAnalysisError('')
    const needsAnalysis = !profile.missingGaps || !profile.jobInsights || !profile.verdict;
    if (needsAnalysis) {
      setAnalyzing(true)
      try {
        const enriched = await fetchProfileAnalysis(profile)
        profile = {
          ...profile,
          role: enriched.role || profile.role,
          skills: enriched.skillsMatrix || profile.skills || [],
          verdict: enriched.verdict || '',
          matchScore: enriched.matchScore || 70,
          missingGaps: enriched.missingGaps || [],
          jobInsights: enriched.jobInsights || null,
          curatedResources: enriched.curatedResources || []
        }
        localStorage.setItem('user_profile', JSON.stringify(profile))
      } catch (error) {
        console.error('Dashboard AI analysis failed:', error)
        setAnalysisError(error.message || 'Could not analyze your profile. Save it again from Profile.')
      } finally {
        setAnalyzing(false)
      }
    }
    applyProfileToDashboard(profile)
  }

  useEffect(() => {
    loadDashboardData()
    const handleProfileUpdate = () => loadDashboardData()
    window.addEventListener('storage_update', handleProfileUpdate)
    function handleClickOutside(event) {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
        setShowConfirmLogout(false)
      }
    }
    document.addEventListener('mousedown',handleClickOutside)
    return () => window.removeEventListener('storage_update', handleProfileUpdate),
    document.removeEventListener('mousedown',handleClickOutside)
  }, [])
  const handleLogout=()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_profile')
    window.dispatchEvent(new Event('storage_update'))
    router.navigate({to:'/login'})
  }
  return (
    
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold text-slate-900">CareerGuide AI</span>
          <button
            type="button"
            className="ml-auto rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <Link
              key={label}
              to={path}
              activeProps={{ className: 'bg-indigo-50 text-indigo-700' }}
              inactiveProps={{ className: 'text-slate-600' }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className='pl-60 hidden lg:block text-center font-serif italic tracking-wide'>
              The best way to predict your career path is to build it day by day.
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <div className='relative' ref={dropdownRef}>
                <button onClick={()=>{
                  setDropdownOpen(!dropdownOpen) 
                  setShowConfirmLogout(false)
                  }} className="flex items-center gap-2 rounded-xl py-1.5 pl-1 pr-2 transition-colors hover:bg-slate-50 focus:outline-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden text-sm font-medium text-slate-800 sm:block">{user?.name || 'User'}</span>
                </button>
                {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100 z-50">
                  {!showConfirmLogout ? (
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      Log Out
                    </button>
                  ):(
                    <div className="p-1 text-center">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Are you sure?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleLogout}
                          className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          Yes, Logout
                        </button>
                        <button
                          onClick={() => setShowConfirmLogout(false)}
                          className="flex-1 rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Hi, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-slate-600">Your career insights from profile-based AI analysis.</p>
          </div>

          {analyzing && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Analyzing your profile — generating skill gaps, resources, and job insights...
            </div>
          )}

          {analysisError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {analysisError}
            </div>
          )}

          {!hasProfile && !analyzing && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              Complete your{' '}
              <Link to="/profile" className="font-semibold text-indigo-600 hover:text-indigo-800">
                Profile
              </Link>{' '}
              with a target role and skills, then click <strong>Save &amp; Analyze Profile</strong>.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                    <Code2 className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{role || 'Your Target Role'}</h2>
                      {matchScore > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                      {verdict || (hasProfile ? 'AI analysis pending.' : 'Set your target role in Profile.')}
                    </p>
                  </div>
                </div>
                <CircularMatch value={matchScore} />
              </div>
              <Link
                to="/roadmap"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto sm:px-8"
              >
                View Roadmap
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm ring-1 ring-indigo-100">
              <div className="relative z-10 max-w-[220px]">
                <h2 className="text-lg font-bold text-slate-900">AI Career Advisor</h2>
                <p className="mt-2 text-sm text-slate-600">Ask about careers, skills, or roadmaps.</p>
                <Link
                  to="/advisor"
                  className="mt-7 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Chat Now
                </Link>
              </div>
              <div className="pointer-events-none absolute -bottom-2 -right-2 flex h-28 w-28 items-center justify-center rounded-2xl bg-white/80 shadow-lg ring-1 ring-indigo-100 sm:h-32 sm:w-32">
                <Bot className="h-16 w-16 text-indigo-500 sm:h-20 sm:w-20" strokeWidth={1.25} />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Skill Gap Overview</h2>
                  <Link to="/skill-gap" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    View Details
                  </Link>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead>
                      <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        <th className="pb-3 pr-2">Skill</th>
                        <th className="pb-3 pr-2">Your Level</th>
                        <th className="pb-3">Gaps to Close</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {skillsMatrix.length > 0 ? (
                        skillsMatrix.map((s) => {
                          const gapValue=Math.max(0,(s.required || 0)-(s.yours || 0))
                          return (
                          <tr key={s.name}>
                            <td className="py-2.5 font-medium text-slate-800">{s.name}</td>
                            <td className="py-2.5 pr-2">
                              <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${getBarColor(s.yours)}`} style={{ width: `${s.yours}%` }} />
                              </div>
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                {gapValue>0?(
                                  <>
                                  <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${gapValue}%` }} />
                                  </div>
                                  <span className="shrink-0 text-xs font-medium text-slate-600">+{gapValue}%</span>
                                  </>
                                ):(
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                                      Achieved
                                  </span>
                                )}
                                </div>
                            </td>
                          </tr>
                        )
                      })
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-xs text-slate-400">
                            <Link to="/profile" className="text-indigo-600 hover:text-indigo-800">
                              Add skills in Profile
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
              {missingGaps && missingGaps.length>0 && (
                <div className='mt-6 border-t border-slate-100 pt-4'>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gaps to close</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {missingGaps.slice(0, 4).map((gap) => (
                      <span
                        key={gap.name}
                        className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100"
                      >
                        {gap.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <div className='space-y-6 lg:col-span-1 flex flex-col justify-start lg:self-stretch'>
              <section className="relative overflow-hidden flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-sm ring-1 ring-indigo-100 min-h-[240px]">
                <div className='relative z-10 max-w-[220px] flex-1 flex flex-col justify-between'>
                  <div>
                    <h2 className="font-bold text-slate-900">Resume Analyzer</h2>
                    <p className="mt-3 text-sm text-slate-600">
                      Upload your resume to check ATS compatibility and missing keywords for your target role.
                    </p>
                  </div>
                  <Link
                    to="/resume-analyzer"
                    className="mt-6 inline-block w-fit flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Upload Resume
                  </Link>
                </div>
                <div className='pointer-events-none absolute -bottom-2 -right-2 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/80 shadow-lg ring-1 ring-indigo-50'>
                  <FileText className="h-12 w-12 text-indigo-500" strokeWidth={1.25}/>
                </div>
              </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Job Market Insights</h2>
                <Link to="/job-insights" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View Report
                </Link>
              </div>
              {jobInsights ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
                      <p className="text-xs font-medium text-slate-600">{jobInsights.demandLevel}</p>
                      <p className="text-[10px] text-slate-500">Demand</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
                      <Wallet className="mx-auto mb-1 h-5 w-5 text-indigo-600" strokeWidth={1.5} />
                      <p className="text-xs font-semibold text-slate-800">{jobInsights.salaryRangeIndia}</p>
                      <p className="text-[10px] text-slate-500">Avg. Salary</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500">Trending Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(jobInsights.trendingConcepts || []).slice(0,5).map((t) => (
                        <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-xs text-slate-400">
                  {hasProfile ? 'Appears after profile analysis.' : 'Complete your profile first.'}
                </p>
              )}
            </section>
          </div>

          </div>
           
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recommended Resources</h2>
              <Link to="/resources" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.length > 0 ? (
                resources.map((r) => {
                  const dynamicPath = `/resources/${encodeURIComponent(r.title.toLowerCase().replace(/\s+/g, '-'))}`;
                  let targetLink = r.link || r.url || r.resourceLink || r.path || r.platform;
                  const isExternal = typeof targetLink === 'string' && (
                    /^https?:\/\//i.test(targetLink) || 
                    /\.(com|dev|org|net|edu|gov|io)\b/i.test(targetLink)
                  )
                  let finalHref = isExternal ? targetLink.toLowerCase().trim() : (r.path || dynamicPath);
                  if(isExternal && !/^https?:\/\//i.test(finalHref)) {
                    finalHref=`https://${finalHref}`
                  }
                  const cardContent=(
                    <article className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${r.color}`}>
                          {r.platform?.slice(0, 1) || 'R'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900">{r.title}</h3>
                          <span className={` mt-2 inline-block max-w-[85%] truncate  rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${r.tagStyle}`}>
                            {r.platform}
                          </span>
                        </div>
                    </article>
                  )
                  return isExternal ? (
                    <a
                      key={r.title}
                      href={finalHref}
                      target="_blank"
                      rel='noopener noreferrer'
                      className="block cursor-pointer rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-indigo-100"
                    >
                      {cardContent}
                    </a>
                  ):(
                    <Link
                      key={r.title}
                      to={finalHref}
                      className="block cursor-pointer rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-indigo-100"
                    >
                      {cardContent}
                    </Link>
                  )
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 lg:col-span-3">
                  {hasProfile ? 'Resources appear after profile analysis.' : 'Save your profile to get personalized resources.'}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
