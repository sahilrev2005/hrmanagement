import React, { useState, useEffect } from 'react';
import { Employee, Project, MatchResult } from '../types';
import { findTopMatches } from '../services/matchingLogic';
import { generateMatchReport } from '../services/geminiService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ProjectFormModal } from './ProjectFormModal';

interface MatchingEngineProps {
  employees: Employee[];
  projects: Project[];
  onAddProject: (project: Project) => void;
}

export const MatchingEngine: React.FC<MatchingEngineProps> = ({ employees, projects, onAddProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Automatically update matches when selection changes
  useEffect(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      const results = findTopMatches(project, employees);
      setMatches(results);
      setAiReport(''); // Clear old report
    }
  }, [selectedProjectId, employees, projects]);

  const handleProjectAdded = (newProj: Project) => {
    onAddProject(newProj);
    setSelectedProjectId(newProj.id);
  };

  const handleGenerateReport = async () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;
    
    setLoadingReport(true);
    const report = await generateMatchReport(project, matches.slice(0, 3));
    setAiReport(report);
    setLoadingReport(false);
  };

  const handleExportCSV = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project || matches.length === 0) return;

    const headers = ['Employee Name', 'ID', 'Total Score', 'Skill Score', 'Experience Score', 'Availability Score', 'Matched Skills'];
    const csvRows = [
      headers.join(','),
      ...matches.map(m => [
        `"${m.employee.name}"`,
        m.employee.id,
        m.totalScore,
        m.breakdown.skillScore.toFixed(2),
        m.breakdown.experienceScore,
        m.breakdown.availabilityScore,
        `"${m.matchedSkills.join('; ')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `matching_results_${project.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Matching Engine</h2>
          <p className="text-gray-500">Select a project to run the allocation algorithm.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Real-Time Project
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Project</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Req: {p.requiredLevel})</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full bg-indigo-50 p-4 rounded-lg text-sm text-indigo-900 border border-indigo-100">
          <p className="font-semibold">Required Skills:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProject?.requiredSkills.map(skill => (
              <span key={skill} className="px-2 py-1 bg-white rounded border border-indigo-200 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>🏆</span> Top Recommendations
          </h3>
          {matches.slice(0, 5).map((match, idx) => (
            <div key={match.employee.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{match.employee.name}</h4>
                    <p className="text-sm text-gray-500">{match.employee.level} • {match.employee.available ? 'Available ✅' : 'Busy ❌'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{match.totalScore}%</div>
                  <div className="text-xs text-gray-400">Match Score</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Skill Match</div>
                  <div className="text-sm font-medium text-gray-800">{match.breakdown.skillScore.toFixed(0)} / 50</div>
                  <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(match.breakdown.skillScore / 50) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Experience</div>
                  <div className="text-sm font-medium text-gray-800">{match.breakdown.experienceScore} / 30</div>
                  <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${(match.breakdown.experienceScore / 30) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Availability</div>
                  <div className="text-sm font-medium text-gray-800">{match.breakdown.availabilityScore} / 20</div>
                  <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${(match.breakdown.availabilityScore / 20) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Score Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matches.slice(0, 5).map((m, i) => ({
                    name: m.employee.name.split(' ')[0], 
                    Score: m.totalScore 
                  }))}
                >
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis hide domain={[0, 100]} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Bar dataKey="Score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">AI Explanation</h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Gemini Powered</span>
            </div>
            
            {!aiReport && !loadingReport && (
               <div className="text-center py-6">
                 <p className="text-indigo-200 text-sm mb-4">Generate a report explaining why these employees were selected based on the data.</p>
                 <button 
                  onClick={handleGenerateReport}
                  className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors w-full"
                 >
                   Generate Report
                 </button>
               </div>
            )}

            {loadingReport && (
              <div className="flex flex-col items-center justify-center py-6 animate-pulse">
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Analyzing skills & data...</p>
              </div>
            )}

            {aiReport && (
              <div className="bg-white/10 rounded-lg p-4 text-sm leading-relaxed max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                 <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleProjectAdded} 
      />
    </div>
  );
};