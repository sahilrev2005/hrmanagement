import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Project, MatchResult, ExperienceLevel } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMatchReport = async (project: Project, topMatches: MatchResult[]): Promise<string> => {
  if (!apiKey) return "API Key not configured. Please add your Gemini API Key to environment variables.";

  const prompt = `
    Act as a Senior HR Analytics Consultant.
    Write a brief executive summary report (max 200 words) justifying the recommendation of the top 3 employees for the project: "${project.name}".

    Project Needs:
    - Skills: ${project.requiredSkills.join(', ')}
    - Level: ${project.requiredLevel}

    Top Candidates:
    ${topMatches.slice(0, 3).map((m, i) => `
      ${i + 1}. ${m.employee.name} (${m.employee.level})
         - Score: ${m.totalScore}/100
         - Matched Skills: ${m.matchedSkills.join(', ')}
         - Available: ${m.employee.available}
    `).join('\n')}

    Explain why these candidates were chosen based on the balance of skills, experience, and availability.
    Format the output as Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No report generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI report due to an API error.";
  }
};

export const extractEmployeeInfoFromResume = async (fileData?: string, mimeType?: string, textContent?: string): Promise<{name: string, level: ExperienceLevel, skills: string[]} | null> => {
  if (!apiKey) return null;

  const parts: any[] = [{ text: "Extract the candidate's full name, experience level (Junior, Mid, or Senior), and a list of technical skills from this resume. Return as JSON." }];
  
  if (fileData && mimeType) {
    parts.push({
      inlineData: {
        data: fileData.split(',')[1],
        mimeType: mimeType
      }
    });
  } else if (textContent) {
    parts.push({ text: textContent });
  } else {
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            level: { type: Type.STRING, description: "Must be 'Junior', 'Mid', or 'Senior'" },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "level", "skills"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error);
    return null;
  }
};

export const generateProjectTemplate = async (name: string): Promise<{description: string, requiredSkills: string[], requiredLevel: ExperienceLevel} | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide realistic project details for a corporate project titled "${name}". Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A professional 2-sentence description of the project." },
            requiredSkills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of 3-5 technical skills required."
            },
            requiredLevel: { 
              type: Type.STRING, 
              description: "Must be 'Junior', 'Mid', or 'Senior'." 
            }
          },
          required: ["description", "requiredSkills", "requiredLevel"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini Project Gen Error:", error);
    return null;
  }
};

export const generatePythonCodeExplanation = async (): Promise<string> => {
  return `
import pandas as pd
import random

# 1. DATA STRUCTURE & SYNTHETIC DATA GENERATION
def generate_data():
    skills_pool = ['Python', 'React', 'Java', 'SQL', 'AWS', 'Docker']
    
    # Generate 20 Employees
    employees = []
    for i in range(1, 21):
        emp = {
            'ID': f'E{i:03d}',
            'Name': f'Employee_{i}',
            'Skills': random.sample(skills_pool, k=random.randint(2, 4)),
            'Level': random.choice(['Junior', 'Mid', 'Senior']),
            'Available': random.choice([True, False]) # Simple Boolean
        }
        employees.append(emp)
        
    # Generate 5 Projects
    projects = []
    for i in range(1, 6):
        proj = {
            'ID': f'P{i:03d}',
            'Required_Skills': random.sample(skills_pool, k=3),
            'Min_Level': random.choice(['Junior', 'Mid', 'Senior'])
        }
        projects.append(proj)
        
    return pd.DataFrame(employees), pd.DataFrame(projects)

# 2. MATCHING ALGORITHM (Weighted Sum)
def calculate_score(employee, project):
    score = 0
    
    # A. Skill Overlap (50 points max)
    req_skills = set(project['Required_Skills'])
    emp_skills = set(employee['Skills'])
    match_count = len(req_skills.intersection(emp_skills))
    # Avoid division by zero
    skill_pct = match_count / len(req_skills) if len(req_skills) > 0 else 0
    score += skill_pct * 50
    
    # B. Experience Match (30 points max)
    levels = {'Junior': 1, 'Mid': 2, 'Senior': 3}
    if levels[employee['Level']] >= levels[project['Min_Level']]:
        score += 30
    elif levels[employee['Level']] == levels[project['Min_Level']] - 1:
        score += 15 # Partial credit
        
    # C. Availability (20 points max)
    if employee['Available']:
        score += 20
        
    return score

def get_top_matches(project_id, df_emp, df_proj):
    # Get project details
    project = df_proj[df_proj['ID'] == project_id].iloc[0]
    
    # Calculate score for every employee
    df_emp['Score'] = df_emp.apply(lambda row: calculate_score(row, project), axis=1)
    
    # Sort and return top 3
    return df_emp.sort_values(by='Score', ascending=False).head(3)

# --- EXECUTION ---
df_employees, df_projects = generate_data()
print("Projects Available:\\n", df_projects[['ID', 'Required_Skills']])
top_picks = get_top_matches('P001', df_employees, df_projects)
print("\\nTop Matches for P001:\\n", top_picks[['ID', 'Name', 'Score', 'Skills', 'Available']])
`;
};