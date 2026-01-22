export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior';

export interface Employee {
  id: string;
  name: string;
  skills: string[];
  level: ExperienceLevel;
  available: boolean;
  avatarUrl: string;
}

export interface Project {
  id: string;
  name: string;
  requiredSkills: string[];
  requiredLevel: ExperienceLevel;
  description: string;
}

export interface MatchResult {
  employee: Employee;
  totalScore: number;
  breakdown: {
    skillScore: number;
    experienceScore: number;
    availabilityScore: number;
  };
  matchedSkills: string[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  EMPLOYEES = 'EMPLOYEES',
  PROJECTS = 'PROJECTS',
  MATCHING = 'MATCHING',
  PYTHON_EXPORT = 'PYTHON_EXPORT'
}