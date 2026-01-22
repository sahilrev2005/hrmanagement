import React, { useState } from 'react';
import { Project, ExperienceLevel } from '../types';
import { generateProjectTemplate } from '../services/geminiService';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredLevel: 'Junior' as ExperienceLevel,
    skills: ''
  });

  const handleAiAssist = async () => {
    if (!formData.name) return;
    setLoading(true);
    const result = await generateProjectTemplate(formData.name);
    if (result) {
      setFormData({
        ...formData,
        description: result.description,
        requiredLevel: result.requiredLevel,
        skills: result.requiredSkills.join(', ')
      });
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: `PRJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: formData.name,
      description: formData.description,
      requiredLevel: formData.requiredLevel,
      requiredSkills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };
    onAdd(newProject);
    onClose();
    setFormData({ name: '', description: '', requiredLevel: 'Junior', skills: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h3 className="font-bold text-gray-800">Add New Real-Time Project</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Next-Gen Cloud Dashboard"
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={!formData.name || loading}
                className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                title="Use AI to generate details"
              >
                {loading ? '...' : '🪄 AI Assist'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Briefly describe the project goals..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience Level</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.requiredLevel}
                onChange={e => setFormData({...formData, requiredLevel: e.target.value as ExperienceLevel})}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g. React, Docker, Python"
              />
              <p className="text-[10px] text-gray-400 mt-1">Comma separated</p>
            </div>
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};