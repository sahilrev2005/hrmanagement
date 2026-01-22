import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { EmployeeTable, ProjectTable } from './components/DataTables';
import { MatchingEngine } from './components/MatchingEngine';
import { PythonExport } from './components/PythonExport';
import { generateEmployees, generateProjects } from './services/dataGenerator';
import { Employee, Project, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.MATCHING);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Initialize Data on Mount
  useEffect(() => {
    setEmployees(generateEmployees(20));
    setProjects(generateProjects(5));
  }, []);

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.MATCHING:
        return <MatchingEngine employees={employees} projects={projects} onAddProject={handleAddProject} />;
      case ViewState.EMPLOYEES:
        return <EmployeeTable employees={employees} projects={projects} onAddEmployee={handleAddEmployee} />;
      case ViewState.PROJECTS:
        return <ProjectTable projects={projects} onAddProject={handleAddProject} />;
      case ViewState.PYTHON_EXPORT:
        return <PythonExport />;
      case ViewState.DASHBOARD:
      default:
        // Simple Dashboard View
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Employees" value={employees.length.toString()} icon="👥" color="blue" />
            <DashboardCard title="Active Projects" value={projects.length.toString()} icon="📁" color="purple" />
            <DashboardCard title="Available Staff" value={employees.filter(e => e.available).length.toString()} icon="✅" color="green" />
            <DashboardCard title="Skill Coverage" value="85%" icon="🎯" color="orange" />
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-8 bg-white p-8 rounded-xl border border-gray-100 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to HR Match AI</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                This system demonstrates an AI-based resource allocation logic. 
                Navigate to the <strong>Match Engine</strong> to see the algorithm in action, 
                or check <strong>Get Python Code</strong> to copy the logic for your assignment.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={() => setCurrentView(ViewState.MATCHING)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-100"
                >
                  Start Allocation
                </button>
                <button 
                  onClick={() => setCurrentView(ViewState.EMPLOYEES)}
                  className="bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  Upload Resume
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

const DashboardCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default App;