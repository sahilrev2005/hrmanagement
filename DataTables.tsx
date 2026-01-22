import React, { useState, useRef, useEffect } from 'react';
import { Employee, Project, ExperienceLevel, MatchResult } from '../types';
import { ProjectFormModal } from './ProjectFormModal';
import { extractEmployeeInfoFromResume } from '../services/geminiService';
import { calculateMatchScore } from '../services/matchingLogic';

interface EmployeeTableProps {
  employees: Employee[];
  projects: Project[];
  onAddEmployee: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, projects, onAddEmployee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedEmps, setExpandedEmps] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<MatchResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    level: 'Junior' as ExperienceLevel,
    available: true,
    skills: '',
    avatarUrl: ''
  });

  // Calculate matches in real-time as skills/level change in the form
  useEffect(() => {
    if (formData.skills || formData.name) {
      const tempEmp: Employee = {
        id: 'TEMP',
        name: formData.name || 'Candidate',
        level: formData.level,
        available: formData.available,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
        avatarUrl: ''
      };
      
      const potentialMatches = projects
        .map(proj => calculateMatchScore(tempEmp, proj))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 2);
        
      setSuggestedMatches(potentialMatches);
    } else {
      setSuggestedMatches([]);
    }
  }, [formData.skills, formData.level, projects, formData.name, formData.available]);

  const toggleExpand = (id: string) => {
    setExpandedEmps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    // Support image-based resumes and PDF via Gemini Vision/Multimodal
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    
    if (supportedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = await extractEmployeeInfoFromResume(reader.result as string, file.type);
        if (result) {
          setFormData(prev => ({
            ...prev,
            name: result.name || prev.name,
            level: result.level as ExperienceLevel || prev.level,
            skills: result.skills.join(', ')
          }));
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Unsupported file type. Please upload an image (JPG, PNG) or a PDF resume.");
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newEmployee: Employee = {
      id,
      name: formData.name,
      level: formData.level,
      available: formData.available,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      avatarUrl: formData.avatarUrl || `https://picsum.photos/seed/${id}/64/64`
    };
    onAddEmployee(newEmployee);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', level: 'Junior', available: true, skills: '', avatarUrl: '' });
    setSuggestedMatches([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Employee Database</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage talent and analyzed resumes</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">{employees.length} Records</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4 w-24">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Level</th>
              <th className="p-4">Availability</th>
              <th className="p-4">Skills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => {
              const isExpanded = expandedEmps[emp.id];
              return (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-mono text-xs text-gray-400">
                    {emp.id}
                  </td>
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                     <img src={emp.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 border border-gray-100 object-cover" />
                     {emp.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight 
                      ${emp.level === 'Senior' ? 'bg-purple-100 text-purple-700' : 
                        emp.level === 'Mid' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {emp.level}
                    </span>
                  </td>
                  <td className="p-4">
                    {emp.available ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-green-700 font-semibold text-[11px]">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span className="text-gray-400 font-medium text-[11px]">Busy</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                      {(isExpanded ? emp.skills : emp.skills.slice(0, 3)).map(skill => (
                        <span 
                          key={skill} 
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold whitespace-nowrap"
                        >
                          {skill}
                        </span>
                      ))}
                      {emp.skills.length > 3 && (
                        <button 
                          onClick={() => toggleExpand(emp.id)}
                          className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline px-1 py-0.5 rounded transition-colors"
                        >
                          {isExpanded ? 'Show less ↑' : `+${emp.skills.length - 3} more`}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-in">
            {/* Left Panel: AI Assistant & Resume Upload */}
            <div className="w-full md:w-5/12 bg-indigo-50/50 p-8 border-r border-gray-100 flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-indigo-700">
                <span className="text-xl">✨</span>
                <h3 className="font-bold">AI Resume Assistant</h3>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center flex-1 
                  ${isAnalyzing ? 'bg-white border-indigo-400 animate-pulse' : 'bg-white border-gray-200 hover:border-indigo-400 hover:bg-white cursor-pointer group'}`}
                onClick={() => !isAnalyzing && resumeInputRef.current?.click()}
              >
                {isAnalyzing ? (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-indigo-700 font-bold text-sm">Analyzing Experience...</p>
                    <p className="text-indigo-400 text-[10px] mt-1">Extracting skills via Gemini AI</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Upload Resume (Image/PDF)</h4>
                    <p className="text-gray-400 text-xs px-4">AI will automatically fill the candidate's profile for you</p>
                    <div className="mt-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      BROWSE FILES
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  ref={resumeInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf" 
                  onChange={handleResumeUpload} 
                />
              </div>

              {/* Match Suggestions Preview */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Project Match Preview</h4>
                <div className="space-y-2">
                  {suggestedMatches.length > 0 ? (
                    suggestedMatches.map(m => (
                      <div key={m.employee.id + m.totalScore} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between animate-fade-in">
                        <div>
                          <p className="text-[11px] font-bold text-gray-800">{m.employee.name === 'Candidate' ? 'Matches Project:' : ''} {m.employee.name.length > 20 ? 'Recommended' : m.employee.name}</p>
                          <p className="text-[10px] text-indigo-500 font-medium">Potential: {m.totalScore}% match</p>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {m.totalScore}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-indigo-100/30 border border-dashed border-indigo-200 rounded-lg py-4 text-center">
                      <p className="text-[10px] text-indigo-400 font-medium">Fill in name and skills to see matches</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Form Fields */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-extrabold text-2xl text-gray-800">Add Employee</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all overflow-hidden bg-gray-50 shadow-inner"
                  >
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-300 group-hover:text-indigo-600 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-bold">AVATAR</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                  />
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Candidate Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Alexander Pierce"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expertise Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Junior', 'Mid', 'Senior'] as ExperienceLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({...formData, level: lvl})}
                          className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${formData.level === lvl ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Status</label>
                     <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium"
                      value={formData.available ? 'yes' : 'no'}
                      onChange={e => setFormData({...formData, available: e.target.value === 'yes'})}
                    >
                      <option value="yes">Available for Match</option>
                      <option value="no">Currently Busy</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Technical Stack (Extracted by AI)</label>
                   <textarea 
                    required
                    rows={3}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-mono placeholder:font-sans"
                    value={formData.skills}
                    onChange={e => setFormData({...formData, skills: e.target.value})}
                    placeholder="Python, React, AWS, GraphQL, Docker..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { resetForm(); setIsModalOpen(false); }}
                    className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Register & Match
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProjectTableProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onAddProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
       <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Project Registry</h2>
          <p className="text-xs text-gray-400 mt-0.5">Define workload and resource requirements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {projects.map(proj => (
          <div key={proj.id} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-300 transition-all bg-white hover:shadow-lg group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{proj.name}</h3>
              <span className="text-[10px] font-bold font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{proj.id}</span>
            </div>
            <p className="text-[12px] text-gray-500 mb-5 leading-relaxed h-9 line-clamp-2">{proj.description}</p>
            <div className="space-y-3 pt-3 border-t border-gray-50">
              <div className="flex justify-between text-[11px] items-center">
                <span className="text-gray-400 font-bold uppercase tracking-tight">Required Level</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                  ${proj.requiredLevel === 'Senior' ? 'bg-purple-100 text-purple-700' : 
                    proj.requiredLevel === 'Mid' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {proj.requiredLevel}
                </span>
              </div>
               <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Tech Stack</span>
                <div className="flex flex-wrap gap-1">
                   {proj.requiredSkills.map(s => <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddProject} 
      />
    </div>
  );
};