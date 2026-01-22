import { Employee, Project, ExperienceLevel } from '../types';

const SKILL_POOL = ['Python', 'React', 'Java', 'SQL', 'AWS', 'Docker', 'Machine Learning', 'Data Analysis', 'Figma', 'TypeScript'];
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Peyton'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomSkills = (count: number): string[] => {
  const shuffled = [...SKILL_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateEmployees = (count: number = 20): Employee[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `EMP${(i + 1).toString().padStart(3, '0')}`;
    const name = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
    const level = getRandomItem<ExperienceLevel>(['Junior', 'Mid', 'Senior']);
    
    // Weighted availability (70% chance of being available)
    const available = Math.random() > 0.3; 
    
    return {
      id,
      name,
      skills: getRandomSkills(Math.floor(Math.random() * 4) + 2), // 2-5 skills
      level,
      available,
      avatarUrl: `https://picsum.photos/seed/${id}/64/64`
    };
  });
};

export const generateProjects = (count: number = 5): Project[] => {
  const projects: Partial<Project>[] = [
    { name: "Website Redesign", description: "Modernizing the corporate website." },
    { name: "AI Chatbot", description: "Customer support automation using NLP." },
    { name: "Migration to Cloud", description: "Moving legacy database to AWS." },
    { name: "Mobile App V2", description: "Flutter based mobile application update." },
    { name: "Data Warehouse", description: "Centralized analytics platform setup." }
  ];

  return projects.map((p, i) => {
    return {
      id: `PRJ${(i + 1).toString().padStart(3, '0')}`,
      name: p.name || `Project ${i + 1}`,
      description: p.description || "Generic project description",
      requiredSkills: getRandomSkills(Math.floor(Math.random() * 3) + 2),
      requiredLevel: getRandomItem<ExperienceLevel>(['Junior', 'Mid', 'Senior'])
    };
  });
};