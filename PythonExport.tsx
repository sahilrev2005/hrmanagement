import React, { useEffect, useState } from 'react';
import { generatePythonCodeExplanation } from '../services/geminiService';

export const PythonExport: React.FC = () => {
  const [code, setCode] = useState<string>('Generating script template...');

  useEffect(() => {
    generatePythonCodeExplanation().then(setCode);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Python Logic Export</h2>
        <p className="text-gray-500">Copy this code for your project report. This logic mirrors the TypeScript logic running in this dashboard.</p>
      </header>

      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-slate-400 font-mono">allocator.py</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Copy Code
          </button>
        </div>
        <pre className="p-6 overflow-x-auto">
          <code className="font-mono text-sm text-green-400">
            {code}
          </code>
        </pre>
      </div>
      
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
        <h4 className="font-bold mb-2">💡 For your report:</h4>
        <p>The algorithm uses a <strong>Weighted Sum Model</strong>:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
          <li><strong>Skill Overlap (50%)</strong>: Percentage of required skills the employee possesses.</li>
          <li><strong>Experience Match (30%)</strong>: Full points if level meets requirements, half if one level below.</li>
          <li><strong>Availability (20%)</strong>: Binary bonus if the employee is currently free.</li>
        </ul>
      </div>
    </div>
  );
};