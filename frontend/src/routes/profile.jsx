import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { User, Mail, ArrowLeft, Save, Plus, Edit2, X, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'
import { buildEnrichedProfile, fetchProfileAnalysis } from '../lib/profileApi'

export const Route = createFileRoute('/profile')({
  component: Profile,
})
function Profile() {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })
  const [role, setRole] = useState('')
  const [dob, setDob] = useState('')
  const [academicStatus, setAcademicStatus] = useState('')
  const [gender, setGender] = useState('Female')
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState('')
  const [skills, setSkills] = useState([])
  const [customSkillName, setCustomSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState(50)
  const navigate=useNavigate()
  const [mounted,setMounted]=useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadUserData = () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    }
    const loadProfileData=()=>{
      const savedProfile = localStorage.getItem("user_profile")
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setRole(parsedProfile.role || '')
        setDob(parsedProfile.dob || '')
        setAcademicStatus(parsedProfile.academicStatus || '')
        setGender(parsedProfile.gender || 'Female')
        setProjects(parsedProfile.projects || [])
        setSkills(parsedProfile.skills || [])
        setIsEditing(false)
      } else {
        setIsEditing(true)
      }
    }
    loadUserData()
    loadProfileData()
    window.addEventListener("storage_update",loadUserData)
    window.addEventListener("storage_update",loadProfileData)
    return () => {
      window.removeEventListener("storage_update", loadUserData);
      window.removeEventListener("storage_update",loadProfileData)
    }
  }, [])
  const handleAddProject = (e) => {
    e.preventDefault()
    if (!newProject.trim()) return
    setProjects([...projects, newProject.trim()])
    setNewProject('')
  }
  const handleRemoveProject = (index) => {
    if (!isEditing) return
    setProjects(projects.filter((_, i) => i !== index))
  }
  const handleAddSkill = (e) => {
    e.preventDefault()
    const trimmedSkill = customSkillName.trim()
    if (!trimmedSkill) return
    const isDuplicate=skills.some(s=>{
      let existingName=""
      if(s && typeof s==='object') {
        existingName=typeof s.name=='object' ? JSON.stringify(s.name) : String(s.name || "")
      } else {
        existingName=String(s || "")
      }
      return existingName.trim().toLowerCase()===trimmedSkill.toLowerCase()
    })
    if (isDuplicate) {
      toast.error("This skill has already been added!")
      return
    }
    setSkills([...skills, { name: trimmedSkill, yours: Number(skillLevel) }])
    setCustomSkillName('')
    setSkillLevel(50)
  }
  const handleRemoveSkill = (nameToRemove) => {
    setSkills(prevSkills=>prevSkills.filter(s=>{
      const skillName=(s && typeof s==='object')?s.name:s
      return String(skillName).trim().toLowerCase()!==String(nameToRemove).trim().toLowerCase()
    }))
  }
  const handleSave = async() => {
    if (!role.trim()) {
      toast.error("Please specify a target role first.")
      return
    }
    if (skills.length === 0) {
        toast.error("Please add at least one skill to calculate your metrics.")
        return
    }
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}")
    if (!currentUser?.email) {
      toast.error("User session missing. Please re-login.")
      return
    }
    const profileData={
      role,
      dob,
      academicStatus,
      gender,
      projects,
      skills
    }
    setSaving(true)
    try {
      const enriched = await fetchProfileAnalysis(profileData)
      const enrichedProfile = buildEnrichedProfile(profileData, enriched)
      const databasePayload = {
        email: currentUser.email,
        role,
        dob,
        academicStatus,
        gender,
        projects,
        skills: enriched.skillsMatrix || skills
      }
      const BASE_URL=import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(databasePayload)
      })
      const dbData = await res.json()
      if (!res.ok) {
        throw new Error(dbData.message || "Failed to sync profile to database server.")
      }
      setSkills(enriched.skillsMatrix || skills)
      localStorage.setItem("user_profile", JSON.stringify(enrichedProfile))
      toast.success("Profile analyzed! Your dashboard is now updated with AI insights.")
      setIsEditing(false)
      window.dispatchEvent(new Event("storage_update"))
      navigate({to:"/dashboard"})
    } catch(error) {
      console.error(error)
      toast.error(error.message || "AI analysis failed. Check that the backend is running and try again.")
      localStorage.setItem("user_profile", JSON.stringify(profileData))
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800'>
      <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8 space-y-6'>
        <div>
          <Link to='/dashboard' className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors'>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* User Top Card */}
        <div className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4'>
          <div className='h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0'>
            {mounted && user?.name ? user.name.charAt(0).toUpperCase() : ""} 
          </div>
          <div className="min-w-0">
            <h1 className='text-xl font-bold text-slate-900 truncate'>{mounted && user.name ? user?.name : "User Name"}</h1>
            <p className='text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 truncate'>
              <Mail className='h-3.5 w-3.5' />
              {mounted && user?.email ? user.email : "user@example.com"}
            </p>
          </div>
        </div>

        {/* Form Configuration Container */}
        <div className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6'>
          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Your Career Profile
            </h2>
            <p className='text-sm text-slate-500 mt-0.5'>
              Enter your target role and skills, then save. AI will analyze your profile and update your dashboard with skill gaps, resources, and job insights.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">What role are you targeting?</label>
              <input 
                type="text" 
                value={role}
                disabled={!isEditing}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Frontend Developer, Full-Stack Developer" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-slate-700'>Date of Birth</label>
              <input 
                type="date" 
                value={dob} 
                disabled={!isEditing}
                onChange={(e) => setDob(e.target.value)} 
                className='w-full rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all' 
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-slate-700'>Gender</label>
              <select 
                value={gender} 
                disabled={!isEditing}
                onChange={(e) => setGender(e.target.value)} 
                className='w-full rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all'
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className='space-y-1.5 md:col-span-2'>
              <label className='text-sm font-medium text-slate-700'>Current Study Status / Passout Year</label>
              <input 
                type="text" 
                value={academicStatus} 
                disabled={!isEditing}
                onChange={(e) => setAcademicStatus(e.target.value)} 
                placeholder="e.g., 3rd Year Computer Engineering Student"
                className='w-full rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all' 
              />
            </div>

            {/* Dynamic Skills Entry Grid */}
            <div className='space-y-3 md:col-span-2 pt-4 border-t border-slate-100'>
              <div>
                <label className='text-sm font-semibold text-slate-800 flex items-center gap-1.5'>
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  Your Technical Core Skills
                </label>
                <p className='text-xs text-slate-500 mt-0.5'>Add individual competencies manually to evaluate overall framework match.</p>
              </div>

              {skills.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                  {skills.map((s, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">{s.yours}%</span>
                      </div>
                      {isEditing && (
                        <button type="button" onClick={() => handleRemoveSkill(s.name)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className='flex flex-col sm:flex-row items-end sm:items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-w-2xl'>
                  <div className="w-full sm:flex-1 space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">Skill Track Name</span>
                    <input 
                      type="text"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      placeholder="e.g., React, JavaScript, Node.js"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="w-full sm:w-40 space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">Level: {skillLevel}%</span>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-3"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddSkill}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 shadow-sm h-[38px]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Project Entry Wrapper */}
            <div className='space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100'>
              <label className='text-sm font-medium text-slate-700'>Your Projects</label>
              
              {projects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {projects.map((p, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-100">
                      {p}
                      {isEditing && (
                        <button type="button" onClick={() => handleRemoveProject(index)} className="hover:text-indigo-900 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className='flex gap-2'>
                  <input 
                    type="text" 
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    placeholder="e.g., E-Commerce Site, Secret Vault" 
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAddProject}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Core Footer Actions */}
          <div className='pt-4 border-t border-slate-100 flex justify-end'>
            {isEditing ? (
              <button 
                type='button' 
                onClick={handleSave}
                disabled={saving}
                className='bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm'
              >
                <Save className='h-4 w-4'/>
                <span>{saving ? "Analyzing with AI..." : "Save & Analyze Profile"}</span>
              </button>
            ) : (
              <button 
                type='button' 
                onClick={() => setIsEditing(true)} 
                className='bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm'
              >
                <Edit2 className='h-4 w-4'/>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}