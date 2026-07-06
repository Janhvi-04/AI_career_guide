import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function findAiSkill(aiList, name) {
  const lower = name.toLowerCase();
  return (
    aiList.find((s) => s.name.toLowerCase() === lower) ||
    aiList.find((s) => lower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(lower))
  );
}

function normalizeProfileSkills(skills) {
  if ( !skills || !Array.isArray(skills)) return [];
  return skills
    .map((s) => {
      if(typeof s==="string") {
        return{name: s.trim(),yours:70};
      }
      if(s && typeof s==="object" && s.name) {
        return {
          name: typeof s.name==="string"?s.name.trim():String(s.name),
          yours:Number(s.yours) || 70
        }
      }
      return null;
    })
    .filter(Boolean);
}

async function resolveRoleSkillRequirements(role, skills) {
  const profileSkills = normalizeProfileSkills(skills);
  if (!profileSkills.length) {
    throw new Error("No profile skills provided for AI requirement analysis.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          skillRequirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                required: { type: "number" },
              },
              required: ["name", "required"],
            },
          },
        },
        required: ["skillRequirements"],
      },
    },
  });

  const prompt = `You are a career skills analyst. Evaluate hiring expectations for this exact candidate profile.

Target job role: "${role}"

Skills the candidate entered in their profile (with self-rated current level):
${JSON.stringify(profileSkills.map((s) => ({ skill: s.name, currentLevel: s.yours })), null, 2)}

Task: For EACH skill listed above, return the minimum proficiency percentage (0-100) employers typically expect for the "${role}" role.

Rules:
- Only evaluate the skills listed in the profile above — do not add or remove skills.
- Use the exact skill name from the profile in your response.
- "required" reflects how important that skill is for "${role}" (core skills higher, peripheral skills lower).
- Core/mandatory skills for this role: 75-90%
- Important supporting skills: 60-75%
- Nice-to-have or peripheral skills: 45-60%
- Do NOT default every skill to the same number.
- Do NOT use 100% unless the skill is an absolute non-negotiable prerequisite for "${role}".`;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text().trim());

  const merged = profileSkills.map((userSkill) => {
    const match =
      (data.skillRequirements || []).find(
        (r) => r.name.toLowerCase() === userSkill.name.toLowerCase(),
      ) || findAiSkill(data.skillRequirements || [], userSkill.name);

    const required = clampPercent(match?.required);
    if (required == null) {
      throw new Error(`AI did not return a required level for skill: ${userSkill.name}`);
    }

    return {
      name: userSkill.name,
      yours: userSkill.yours,
      required,
    };
  });

  return merged;
}

app.post("/api/profile/analyze", async (req, res) => {
  let { role, projects, skills } = req.body;
  let skillsPayload=[];
  try {
    skillsPayload = normalizeProfileSkills(skills);

    if (!role) {
      return res.status(400).json({ success: false, message: "Target role is required for AI evaluation." });
    }
    if (!skillsPayload.length) {
      return res.status(400).json({ success: false, message: "At least one skill is required." });
    }

    // 1. COMBINE ALL SCHEMAS INTO ONE CALL TO SAVE RE-REQUEST QUOTAS
    const unifiedModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Using standard flash to handle larger structural schemas comfortably
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            skillData: {
              type: "object",
              properties: {
                matchScore: { type: "number" },
                verdict: { type: "string" },
                missingSkills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      priority: { type: "string", description: "Must be High, Medium, or Low" },
                      whyItMatters: { type: "string" }
                    },
                    required: ["name", "priority", "whyItMatters"]
                  }
                }
              },
              required: ["matchScore", "verdict", "missingSkills"]
            },
            roadmapData: {
              type: "object",
              properties: {
                estimatedTotalWeeks: { type: "string" },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phaseNumber: { type: "number" },
                      phaseTitle: { type: "string" },
                      duration: { type: "string" },
                      topicsToMaster: { type: "array", items: { type: "string" } },
                      practicalProject: { type: "string" }
                    },
                    required: ["phaseNumber", "phaseTitle", "duration", "topicsToMaster", "practicalProject"]
                  }
                }
              },
              required: ["estimatedTotalWeeks", "milestones"]
            },
            jobData: {
              type: "object",
              properties: {
                demandLevel: { type: "string" },
                salaryRangeIndia: { type: "string" },
                trendingConcepts: { type: "array", items: { type: "string" } }
              },
              required: ["demandLevel", "salaryRangeIndia", "trendingConcepts"]
            },
            resourcesData: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  platform: { type: "string" },
                  link:{type:"string"}
                },
                required: ["title", "platform","link"]
              }
            }
          },
          required: ["skillData", "roadmapData", "jobData", "resourcesData"]
        }
      }
    });

    const unifiedPrompt = `You are an expert technical career strategist. Evaluate this candidate profile for the target role: "${role}".
    
    Profile Details:
    - Current Skills: ${JSON.stringify(skillsPayload)}
    - Projects: ${Array.isArray(projects) ? projects.join(", ") : "None"}

    Perform a full placement readiness audit. Generate:
    1. A match score and short skill gap priority matrix.
    2. A structured milestone roadmap layout.
    3. Indian placement tech job market trends and salary estimates (LPA),don't give descriptions.
    4. Exactly 3 tailored documentation platforms to study, including their exact official documentation web URL links.`;

    const result = await unifiedModel.generateContent(unifiedPrompt);
    const parsedData = JSON.parse(result.response.text().trim());

    const skillsMatrix = await resolveRoleSkillRequirements(role, skillsPayload);

    // 2. DISPATCH THE ENTIRE DATA SET IN A SINGLE CLEAN RESPONSE Object
    return res.json({
      success: true,
      aiAnalysis: {
        role,
        projects: Array.isArray(projects) ? projects : [],
        matchScore: parsedData.skillData.matchScore,
        verdict: parsedData.skillData.verdict,
        skillsMatrix,
        missingGaps: parsedData.skillData?.missingSkills || [],
        roadmap: parsedData.roadmapData || [],
        jobInsights: {
          demandLevel:parsedData.jobData?.demandLevel,
          salaryRangeIndia:parsedData.jobData?.salaryRangeIndia,
          trendingConcepts:parsedData.jobData?.trendingConcepts
        },
        curatedResources: parsedData.resourcesData || []
      }
    });

  } catch (error) {
    console.error("AI Analysis Route Failure Stack:", error);

    // 3. FAULT TO LOCAL RESILIENT FALLBACK ON RATE LIMITS (429/503)
    if (error.status === 429 || error.status === 503 || error.message?.includes("429") || error.message?.includes("503")) {
      console.warn("Serving unified fallback structure due to API limits.");
      if(!skillsPayload || !skillsPayload.length) {
        try {
          skillsPayload=normalizeProfileSkills(skills)
        } catch(_) {
          skillsPayload=[]
        }
      }
      const diagnosticSkills=Array.isArray(skillsPayload)?skillsPayload:[]
      const safeSkillsMatrix=diagnosticSkills.map(s=>({
        name:s && s.name?s.name:"Core Skill",
        yours:s && s.yours?Number(s.yours):70,
        required:80
      }))
      if(safeSkillsMatrix.length===0) {
        safeSkillsMatrix.push(
          {name:"Full-Stack Development",yours:75,required:85},
          {name:"JavaScript / Node.js Engine",yours:70, required:80}
        )
      }
      return res.status(200).json({
        success: true,
        aiAnalysis: {
          role:role || "Your Role",
          projects: Array.isArray(projects) ? projects : [],
          matchScore: 70,
          verdict: "Profile running in local baseline mode due to API query limits.",
          skillsMatrix: safeSkillsMatrix,
          missingGaps: [
            { name: "System Architecture", priority: "High", whyItMatters: "Required for robust engineering pipelines." }
          ],
          roadmap: {
            estimatedTotalWeeks: "4 Weeks",
            milestones: [
              { phaseNumber: 1, phaseTitle: "Foundational Expansion", duration: "2 Weeks", topicsToMaster: ["System Core Hooks", "State Machinery"], practicalProject: "Refactor current portfolio systems" }
            ]
          },
          jobInsights: {
            demandLevel: "High",
            salaryRangeIndia: "₹6 – 12 LPA",
            trendingConcepts: ["Microservices Infrastructure", "Cloud Tooling Frameworks"]
          },
          curatedResources: [
            { title: "MDN Web Engineering Docs", platform: "Mozilla Developer Network" },
            { title: "Official Architecture Guides", platform: "Documentation" }
          ]
        }
      });
    }
    res.status(500).json({ success: false, message: "AI processing pipeline hit an error: ${error.message}" });
  }
});
app.post("/api/profile",async(req,res)=>{
  try {
    const {userId, role, dob, gender, academicStatus, projects, skills}=req.body;
    if(!userId) {
      return res.status(400).json({success:false,message:"User ID is required."})
    }
    const updatedUser=await User.findByIdAndUpdate(
      userId,
      {
        $set:{
          role:role||"",
          dob:dob||"",
          gender:gender||"",
          academicStatus:academicStatus||"",
          projects:Array.isArray(projects)?projects:[],
          skills:Array.isArray(skills)?skills:[]
        }
      },
      {new:true}
    )
    res.json({success:true,message:"Profile saved successfully!",data:updatedUser})
  } catch(error) {
    res.status(500).json({success:false,message:"Error saving profile details."})
  }
})
app.get("/api/profile/:userId",async(req,res)=>{
  try {
    const userProfile=await User.findById(req.params.userId).select("role dob gender academicStatus projects skills")
    if(!userProfile) {
      return res.status(404).json({success:false,message:"User not found"})
    } res.json({success:true,data:userProfile})
  } catch(error) {
    res.status(500).json({success:false,message:"Error fetching profile information."})
  }
})
app.post("/api/recommend", async (req, res) => {
  try {
    const { interests, skills } = req.body;
    if (!skills || !interests) {
      return res.status(400).json({
        success: false,
        message: "Skills and interests are required fields."
      });
    }
    // 1. Tell Gemini exactly what structural format you want using native schema validation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          description: "List of 3 career recommendations",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              roadmap: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["title", "description", "roadmap"],
          },
        },
      }
    });
    const prompt = `Suggest 3 best career options for a person based on these parameters. 
    Skills: ${skills}
    Interests: ${interests}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Gemini Error Stack:", error);
    if (error.status === 503 || error.message?.includes("503") || error.message?.includes("Service Unavailable")) {
      return res.status(503).json({
        success: false,
        message: "AI servers are heavily overloaded right now. Please click again in a few seconds!"
      });
    }
    // 3. Robust error checking for quota exhaustion
    const isRateLimit = 
      error.status === 429 || 
      error.message?.includes("429") || 
      error.message?.includes("Quota exceeded");
    if (isRateLimit) {
      return res.status(429).json({
        success: false,
        message: "The AI service is temporarily rate-limited due to heavy free-tier usage. Please retry in a minute!"
      });
    }
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while analyzing careers.",
    });
  }
});
app.post("/api/resources",async(req,res)=>{
  try{
    const {topic,level}=req.body;
    if(!topic) {
      return res.status(400).json({success:false, message: "Topic search query is required."})
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          description: "List of 4 distinct, highly accurate resource search configurations",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Clear title of the learning resource topic" },
              platform: { type: "string", description: "Must be exactly one of these strings: YouTube, GeeksforGeeks, W3Schools" },
              contentType: { type: "string", description: "e.g., Full Video Course, Documentation Article, Code Lab Guide" },
              description: { type: "string", description: "Brief overview summary of what this module covers" },
              searchQuery: { type: "string", description: "The ultimate clear keywords string to instantly pull this exact content" }
            },
            required: ["title", "platform", "contentType", "description", "searchQuery"]
          }
        }
      }
    })
    const prompt=`Provide exactly 4 highly-rated learning resource mappings for a user wanting to learn "${topic}". 
    Target Experience Level: ${level || 'Beginner'}.
    Distribute the resources smartly across platforms: include some video content and some documentation references.`;
    const result=await model.generateContent(prompt);
    const text=result.response.text();
    const parsedResources=JSON.parse(text);
    res.json({
      success:true, data:parsedResources
    });
  } catch(error) {
    console.error("Resouces API Error Stack:",error);
    if (error.status === 503 || error.message?.includes("503") || error.message?.includes("Service Unavailable")) {
      return res.status(503).json({
        success: false,
        message: "Servers are heavily overloaded right now. Please click again in a few seconds!"
      });
    }
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded")) {
      return res.status(429).json({
        success: false,
        message: "The service is temporarily rate-limited due to heavy free-tier usage. Please retry in a minute!"
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "An internal server error occurred while sourcing learning resources." 
    });
  }
})
app.post("/api/skill-gap",async(req,res)=>{
  try {
    const {targetRole,currentSkills}=req.body;
    if(!targetRole || !currentSkills) {
      return res.status(400).json({success:false, message:"Target job role and current skills are both required."})
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite",
      generationConfig:{
        responseMimeType: "application/json",
        responseSchema:{
          type:"object",
          properties:{
            matchingSkills:{
              type: "array",
              items: {type:"string"},
              description: "List of user current skills that map perfectly to the target profile benchmarks."
            },
            missingSkills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  priority: { type: "string", description: "Must be High, Medium, or Low" },
                  whyItMatters: { type: "string" }
                },
                required: ["name", "priority", "whyItMatters"]
              }
            },
            verdict:{type:"string"}
          },
          required:["matchingSkills","missingSkills","verdict"]
        }
      }
    });
    const prompt = `You are an expert Placement Assessor. Analyze the skill gap for an applicant aiming for the role of "${targetRole}".
    The user's current skillset is: "${currentSkills}".
    Compare their current skills against standard core industry benchmarks for this role.`;
    const result=await model.generateContent(prompt);
    const text=result.response.text();
    const parsedAnalysis=JSON.parse(text);
    res.json({success:true,data:parsedAnalysis})
  } catch (error) {
    console.error("Skill Gap API Error Stack:", error);
    if (error.status === 503 || error.message?.includes("503")) {
      return res.status(503).json({ success: false, message: "Servers are busy. Please try analyzing again in a few seconds!" });
    }
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ success: false, message: "Rate limit reached. Please give it a minute to cool down." });
    }
    res.status(500).json({ success: false, message: "Internal server error analyzing skills gap." });
  }
})
app.post("/api/roadmap",async(req,res)=>{
  try {
    const {targetGoal,timeframe}=req.body;
    if(!targetGoal) {
      return res.status(400).json({
        succes:false, message: "Target goal or tech stack description is required."
      })
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType:"application/json",
        responseSchema:{
          type:"object",
          properties:{
            title:{type:"string"},
            estimatedTotalWeeks:{type:"string"},
            milestones:{
              type:"array",
              items:{
                type:"object",
                properties:{
                  phaseNumber:{type:"number"},
                  phaseTitle:{type:"string"},
                  duration:{type:"string",description:"e.g. Week 1-2"},
                  topicsToMaster:{
                    type:"array",
                    items:{type:"string"}
                  },
                  practicalProject:{type:"string",description:"A small, concrete min-project to build to solidify this phase."}
                },
                required:["phaseNumber","phaseTitle","duration","topicsToMaster","practicalProject"]
              }
            }
          },
          required:["title","estimatedTotalWeeks","milestones"]
        }
      }
    });
    const prompt = `You are an elite Mentor. Generate a highly structured, practical, step-by-step learning roadmap for achieving the following goal: "${targetGoal}".
    The user wants to optimize their schedule for a preferred timeframe of: "${timeframe || 'Flexible / As soon as possible'}".
    Ensure the path starts from foundational prerequisites and moves logically toward advanced deployment/production concepts. Every milestone must have a tangible mini-project.`;
    const result=await model.generateContent(prompt);
    const text=result.response.text();
    const parsedRoadmap=JSON.parse(text);
    res.json({success:true,data:parsedRoadmap})
  } catch(error) {
    console.error("Roadmap API Error Stack:",error);
    if(error.status==503 || error.message?.includes("503")) {
      return res.status(503).json({success:false,message:"AI engines are heavily loaded. Please click generate again!"})
    }
    if(error.status==429 || error.message?.includes("429")) {
      return res.status(429).json({success: false,message:"Rate limit reached. Please wait a brief moment before retrying."})
    }
    res.status(500).json({success:false,message:"Internal server error creating your custom roadmap."})
  }
})
app.post("/api/resume-analyzer",async(req,res)=>{
  try {
    const {resumeText, targetRole}=req.body
    if(!resumeText || !targetRole) {
      return res.status(400).json({success:false,message:"Both resume content and target job role are required."})
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite",
      generationConfig:{
        responseMimeType:"application/json",
        responseSchema:{
          type:"object",
          properties:{
            atsScore:{type:"number",description:"An alignment score out of 100"},
            criticalFixes:{
              type:"array",
              items:{
                type:"object",
                properties:{
                  issue:{type:"string",description:"What is wrong or missing (e.g. Missing Docker keywords)"},
                  impact:{type:"string",description:"High, Medium, or Low"},
                  remedy:{type:"string",description:"Exactly how to rewrite or rephrase the experiance section to fix it."}
                },
                required:["issue","impact","remedy"]
              }
            },
            keyKeywordsMissing:{
              type:"array",
              items:{type:"string"},
              description:"High-value industry keywords or frameworks missing from the text."
            },
            structuralVerdict:{type:"string",description:"A blunt, realistic assessment of whether this resume clears initial screenings."}
          },
          required:["atsScore","criticalFixes","keyKeywordsMissing","structuralVerdict"]
        }
      }
    })
    const prompt=`You are an elite corporate recruiter and ATS optimization machine. Analyze the following resume text against the core benchmarks for a "${targetRole}" position.
    Resume Text:
    """
    ${resumeText}
    """
    Calculate a realistic ATS match percentage. Isolate specific keyword omissions and format actionable rewrites that maintain ethical description parameters.`
    const result=await model.generateContent(prompt)
    const text=result.response.text()
    if (text.startsWith("```json")) {
      text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```/, "").replace(/```$/, "").trim();
    }
    const parsedAnalysis=JSON.parse(text)
    res.json({success:true,data:parsedAnalysis})
  } catch (error) {
    console.error("Resume Analyzer Error Stack:",error)
    if(error.status===503 || error.message?.includes("503")) {
      return res.status(503).json({success:false,message:"AI engines are heavily loaded. Please retry in a few seconds!"})
    }
    res.status(500).json({success:false,message:"Internal server error parsing resume profile."})
  }
})
app.post("/api/job-insights",async(req,res)=>{
  try {
    const {targetRole}=req.body
    if(!targetRole) {
      return res.status(400).json({success:false,message:"Target role is required."})
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite",
      generationConfig:{
        responseMimeType:"application/json",
        responseSchema:{
          type:"object",
          properties:{
            roleTitle:{type:"string"},
            growthRatePercentage:{type:"number",description:"Year-over-year percentage growth rate, e.g. 24"},
            demandLevel:{type:"string",description:"High, Medium, Critical, or Emerging"},
            marketDemandScore:{type:"number",description:"Score out of 100 representing market volume."},
            salaryRanges:{
              type:"object",
              properties:{
                entryLevel:{type:"string",description:"e.g. ₹4L - ₹6L"},
                midLevel:{type:"string",description:"e.g. ₹8L - ₹12L"},
                seniorLevel:{type:"string",description:"e.g. ₹18L - ₹25L"}
              },
              required:["entryLevel","midLevel","seniorLevel"]
            },
            trendingSkills:{
              type:"array",
              items:{
                type:"object",
                properties:{
                  skillName:{type:"string"},
                  demandPercentage:{type:"number",description:"Percentage from 0 to 100"},
                  growthTrend:{type:"string",description:"Growing, Stable or Exploding."}
                },
                required:["skillName","demandPercentage","growthTrend"]
              }
            },
            topHiringLocations:{
              type:"array",
              items:{type:"string"}
            },
            industryOutlook:{
              type:"string"
            }
          },
          required:["roleTitle","growthRatePercentage","demandLevel","marketDemandScore","salaryRanges","trendingSkills","topHiringLocations","industryOutlook"]
        }
      }
    })
    const prompt=`Provide precise, realistic, up-to-date technical hiring market insights for the role: "${targetRole}" within the current tech industry landscape. Focus on localized Indian market context defaults (LPA ranges) mixed with general global trends where relevant. Ensure numbers display as realistic benchmarks.`
    const result=await model.generateContent(prompt)
    const text=result.response.text().trim()
    if (text.startsWith("```json")) {
      text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```/, "").replace(/```$/, "").trim();
    }
    const parsedInsights=JSON.parse(text)
    res.json({success:true,data:parsedInsights})
  } catch (error) {
    console.error("Market Insights Error Stack:",error)
    if (error.status === 503 || error.message?.includes("503")) {
      return res.status(503).json({ success: false, message: "Insight engines are congested. Please try again in a moment!" });
    }
    res.status(500).json({ success: false, message: "Internal server error gathering market insights trends." });
  }
})
app.post("/api/advisor",async(req,res)=>{
  try{
    const {message,history}=req.body
    if(!message || message.trim()==="") {
      return res.status(400).json({success:false,message:"Message payload cannot be empty."})
    }
    const model=genAI.getGenerativeModel({
      model:"gemini-2.0-flash",
      systemInstruction:"You are an elite, professional Assessor and Career Mentor. Provide direct, highly tactical advice regarding technical stacks, milestones, principles, and campus placemet evaluations. Keep responses insightful, scannable, structured, and strictly concise without using emojis."
    })
    const chat=model.startChat({history: history && Array.isArray(history)?history:[]})
    const result=await chat.sendMessage(message)
    const aiResponseText=result.response.text()
    res.json({success:true,reply:aiResponseText})
  } catch(error) {
    console.error("Advisor Chatbot Processing Error:",error)
    if(error.status===429 || error.message?.includes("429")) {
      return res.status(429).json({success:false,message:"Rate limit restriction encountered. Cool down a moment."})
    }
    if (error.status === 503 || error.message?.includes("503")) {
      return res.status(503).json({ 
        success: false, 
        message: "The AI service is experiencing heavy traffic. Please wait a moment and try sending your message again." 
      })
    }
    res.status(500).json({success:false,message:"Internal server processing failure compiling message reply."})
  }
})
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});
const PORT= process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});