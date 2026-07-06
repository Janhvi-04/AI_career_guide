import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const Route = createFileRoute("/recommendation")({
  component: Recommendation,
})

function Recommendation() {
  const [skills, setSkills] = useState("")
  const [interests, setInterests] = useState("")
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const generateRecommendations = async () => {
    setLoading(true)
    setErrorMessage("")
    setRecommendations([])
    try {
      const response = await fetch(`${BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills,
          interests,
        }),
      })
      const data = await response.json()
      console.log(data)
      if(data.success) {
        setRecommendations(data.data)
      } else {
        setErrorMessage(data.message || "Something went wrong.")
      }
    } catch (error) {
      console.log(error)
      setErrorMessage("Failed to connect to the server. Please check if backend is running.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-650 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        {/* INPUT CONFIGURATION FORM */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900">AI Career Architecture</h1>
          <p className="mt-2 text-slate-600">Enter your core competencies to build interactive technical blueprints.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm text-slate-700">Your Tech/Core Skills</label>
              <input
                type="text"
                placeholder="e.g. Bootstrap, MongoDB, Data Structures"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-slate-700">Interests & Fields</label>
              <input
                type="text"
                placeholder="e.g. System Security, Designing, Cryptography, Automation"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition"
            >
              {loading ? "Constructing Roadmap Models..." : "Analyze Alignment Profiles"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm">
            <strong>Configuration Note:</strong> {errorMessage}
          </div>
        )}

        {/* GENERATED ROADMAP CARDS DISPLAY */}
        <div className="space-y-4">
          {recommendations?.map((career, index) => (
            <div key={index} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">{career.title}</h2>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">{career.description}</p>
              
              <div className="mt-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-2">Milestone Blueprints</h3>
                <ul className="space-y-2 text-slate-600 text-sm pl-2 border-l-2 border-indigo-100">
                  {career.roadmap.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}