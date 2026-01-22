import { Employee, Project, MatchResult, ExperienceLevel } from '../types';

const LEVEL_VALUES: Record<ExperienceLevel, number> = {
  'Junior': 1,
  'Mid': 2,
  'Senior': 3
};

export const calculateMatchScore = (employee: Employee, project: Project): MatchResult => {
  // 1. Skill Overlap (50% Weight)
  const requiredSkillsSet = new Set(project.requiredSkills);
  const matchedSkills = employee.skills.filter(skill => requiredSkillsSet.has(skill));
  
  // Avoid division by zero
  const skillRatio = project.requiredSkills.length > 0 
    ? matchedSkills.length / project.requiredSkills.length 
    : 0;
  
  const skillScore = skillRatio * 50; // Max 50 points

  // 2. Experience Match (30% Weight)
  const empLevelVal = LEVEL_VALUES[employee.level];
  const projLevelVal = LEVEL_VALUES[project.requiredLevel];
  
  let experienceScore = 0;
  if (empLevelVal >= projLevelVal) {
    experienceScore = 30; // Full points if they meet or exceed requirement
  } else if (empLevelVal === projLevelVal - 1) {
    experienceScore = 15; // Half points if they are one level below (potential growth)
  } else {
    experienceScore = 0; // No points if too junior
  }

  // 3. Availability (20% Weight)
  const availabilityScore = employee.available ? 20 : 0;

  const totalScore = Math.round(skillScore + experienceScore + availabilityScore);

  return {
    employee,
    totalScore,
    breakdown: {
      skillScore,
      experienceScore,
      availabilityScore
    },
    matchedSkills
  };
};

export const findTopMatches = (project: Project, employees: Employee[]): MatchResult[] => {
  const scored = employees.map(emp => calculateMatchScore(emp, project));
  // Sort descending by total score
  return scored.sort((a, b) => b.totalScore - a.totalScore);
};