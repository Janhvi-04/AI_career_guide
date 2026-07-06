const BASE_URL = import.meta.env.VITE_BACKEND_URL

export async function fetchProfileAnalysis(profileData) {
  const res = await fetch(`${BASE_URL}/profile/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: profileData.role,
      projects: profileData.projects,
      skills: profileData.skills,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to analyze profile");
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to analyze profile")
  return data.aiAnalysis;
}

export function getSkillsSignature(skills) {
  return (skills || [])
    .map((s) => `${String(s.name).trim().toLowerCase()}:${Number(s.yours) || 0}`)
    .sort()
    .join("|");
}

export function getProfileSignature(profile) {
  const projectsSig = (profile?.projects || [])
    .map((p) => String(p).trim().toLowerCase())
    .sort()
    .join("|");
  return `${String(profile?.role || "").trim().toLowerCase()}::${getSkillsSignature(profile?.skills)}::${projectsSig}`;
}

export function buildEnrichedProfile(profileData, enriched) {
  return {
    ...profileData,
    skills: enriched.skillsMatrix,
    matchScore: enriched.matchScore,
    verdict: enriched.verdict,
    missingGaps: enriched.missingGaps,
    curatedResources: enriched.curatedResources,
    jobInsights: enriched.jobInsights,
    roadmap: enriched.roadmap,
    profileAiAnalyzed: true,
    profileAnalysisSignature: getProfileSignature(profileData),
  };
}

export function needsFullProfileAnalysis(profile) {
  if (!profile?.role?.trim() || !profile?.skills?.length) return false;
  if (!profile.profileAiAnalyzed) return true;
  if (profile.profileAnalysisSignature !== getProfileSignature(profile)) return true;
  if (!profile.jobInsights?.demandLevel || !profile.jobInsights?.salaryRangeIndia) return true;
  if (!Array.isArray(profile.curatedResources) || profile.curatedResources.length === 0) return true;
  if (!profile.skills.some((s) => Number(s.required) > 0)) return true;
  return false;
}
