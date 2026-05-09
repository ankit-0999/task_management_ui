'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/Button';
import { Plus, FolderKanban, Trash2 } from 'lucide-react';
import { CreateProjectModal, ProjectFormData } from '@/components/CreateProjectModal';
import api from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [refreshTrigger]);

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await api.post('/projects/', data);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Project created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create project");
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? All tasks inside will be lost.")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete project");
    }
  };

  return (
    <DashboardLayout userName="Ankit">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              Projects
            </h1>
            <p className="text-gray-500 font-medium">Manage all your team's ongoing projects.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#7199D6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md border-none"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 font-medium">No projects found.</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow relative group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FolderKanban className="w-6 h-6 text-[#7199D6]" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                  </div>
                  
                  {/* Delete button appears on hover */}
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{project.description}</p>
                <Button variant="secondary" className="w-full text-sm">View Board</Button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </DashboardLayout>
  );
}
