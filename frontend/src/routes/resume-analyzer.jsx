import { createFileRoute,Link } from '@tanstack/react-router'
import { useState,useEffect } from 'react'

export const Route = createFileRoute('/resume-analyzer')({
  component: ResumeAnalyzer,
})

function ResumeAnalyzer() {
  const [targetRole,setTargetRole]=useState("")
  const [file,setFile]=useState(null)
  const [analysis,setAnalysis]=useState(null)
  const [loading,setLoading]=useState(false)
  const [loadingText,setLoadingText]=useState("")
  const [errorMessage,setErrorMessage]=useState("")
  const [pdfjsLib, setPdfjsLib] = useState(null)
  const [mammothInstance, setMammothInstance] = useState(null)
  useEffect(() => {
    import('pdfjs-dist').then((pdfjs) => {
      // Use the standard cloudflare worker to prevent bundler asset tracing issues
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      setPdfjsLib(pdfjs);
    }).catch(err => {
      console.error("Failed to dynamically load PDF worker", err);
    });
    import('mammoth').then((mammothModule) => {
      setMammothInstance(mammothModule);
    }).catch(err => console.error("Failed to load Word Doc engine:", err));
  }, []);
  const extractTextFromPDF=async(arrayBuffer)=>{
    if (!pdfjsLib) {
      throw new Error("PDF parser engine is still initializing. Please try again in a moment.");
    }
    const loadingTask=pdfjsLib.getDocument({data:arrayBuffer})
    const pdf=await loadingTask.promise
    let fulltext=""
    for(let i=1;i<=pdf.numPages;i++) {
      const page=await pdf.getPage(i)
      const textContent=await page.getTextContent()
      const pageText=textContent.items.map((item)=>item.str).join(" ")
      fulltext+=pageText+"\n"
    }
    return fulltext
  }
  const extractTextFromDocx=async(arrayBuffer)=>{
    const result=await mammothInstance.extractRawText({arrayBuffer})
    return result.value
  }
  const handleAnalyzeResume=async(e)=>{
    e.preventDefault()
    if(!targetRole.trim()) {
      setErrorMessage("Please fill out your target job role.")
      return
    }
    if(!file) {
      setErrorMessage("Please upload a PDF or Word document resume file.")
      return
    }
    setLoading(true)
    setErrorMessage("")
    setAnalysis(null)
    try{
      setLoadingText("Reading file data...")
      const arrayBuffer=await file.arrayBuffer()
      let extractedText=""
      if(file.type==="application/pdf" || file.name.endsWith(".pdf")) {
        setLoadingText("Extracting text from PDF file...")
        extractedText=await extractTextFromPDF(arrayBuffer)
      } else if(file.type==="application/vnd.openxmlformats-officedocuments.wordprocessingml.document" || file.name.endsWith(".docx")) {
        setLoadingText("Extracting text from Word document...")
        extractedText=await extractTextFromDocx(arrayBuffer)
      } else {
        throw new Error("Unsupported file format. Please upload a valid .pdf or .docx file")
      }
      if(!extractedText.trim()) {
        throw new Error("Could not extraxt any readable text from this document.")
      }
      setLoadingText("Scanning text against ATS keyword matrix...")
      const BASE_URL=import.meta.env.VITE_BACKEND_URL
      const response=await fetch(`${BASE_URL}/resume-analyzer`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({targetRole,resumeText:extractedText})
      })
      const data=await response.json()
      if(data.success && data.data) {
        setAnalysis(data.data)
      } else {
        setErrorMessage(data.message || "Failed to parse and score resume content.")
      }
    } catch(error) {
      console.error(error)
      setErrorMessage(error.message || "Could not process file. Verify your gateway console logs.")
    } finally {
      setLoading(false)
      setLoadingText("")
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
          <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>ATS Resume Optimizer</h1>
          <p className='mt-2 text-slate-500 text-sm'>Upload your resume document directly to run automated layout audits and keyword checks.</p>
          <form onSubmit={handleAnalyzeResume} className='mt-6 space-y-5'>
            <div>
              <label className="mb-2 block font-medium text-sm text-slate-700">What is your Target Job Role?</label>
              <input
                type="text"
                placeholder="e.g., Frontend Engineer, Security Analyst, Java Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#324AB2] text-sm transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-sm text-slate-700">Upload Resume File (.pdf, .docx)</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="w-8 h-8 text-slate-400 group-hover:text-[#324AB2] mb-2 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : "Click to choose or drag resume file here"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF or Microsoft Word format up to 5MB</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition shadow-sm h-12 flex items-center justify-center text-sm"
            >
              {loading ? loadingText : "Run Optimization Scan"}
            </button>
          </form>
        </div>
        {errorMessage && (
          <div className='rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm font-medium'>
            <strong>System Notice:</strong> {errorMessage}
          </div>
        )}
        {analysis && (
          <div className='space-y-6'>
            <div className='bg-gradient-to-r from-violet-50 via-indigo-50/60 to-blue-50 p-6 rounded-3xl shadow-sm border border-[#324AB2]/10 flex flex-col md:flex-row gap-6 items-center'>
              <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-white border-4 border-[#324AB2] shadow-inner shrink-0">
                <span className="text-2xl font-black text-[#324AB2]">{analysis.atsScore}%</span>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <span className="inline-block text-[10px] font-extrabold uppercase bg-[#324AB2] text-white px-2.5 py-0.5 rounded-full tracking-wider mb-1">
                  Overall ATS Profile Score
                </span>
                <h2 className='text-xl font-bold text-slate-900'>Recruiter Review Verdict</h2>
                <p className='text-slate-600 text-sm leading-relaxed mt-1 font-medium'>{analysis.structuralVerdict}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-1 space-y-3'>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Missing Keywords
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">ATS engine expects these exact terminology matches:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.keyKeywordsMissing?.map((keyword, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 font-semibold rounded-lg text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-2 space-y-4'>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  Actionable Adjustments Required
                </h3>               
                <div className='space-y-3'>
                  {analysis.criticalFixes?.map((fix, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{fix.issue}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${
                          fix.impact.toLowerCase() === "high" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {fix.impact} Impact
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed bg-white p-3 rounded-xl border border-slate-100 font-mono">
                        <strong className="text-[#324AB2] font-sans not-italic block text-[10px] uppercase tracking-wider mb-1">Recommended Rewrite Strategy:</strong>
                        {fix.remedy}
                      </p>
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
