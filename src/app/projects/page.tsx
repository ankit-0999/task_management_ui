'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';
import { Plus, FolderKanban, Trash2, Edit2, Eye } from 'lucide-react';
import { CreateProjectModal, ProjectFormData } from '@/components/CreateProjectModal';
import { ProjectViewModal } from '@/components/ProjectViewModal';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getStoredUserRole, getStoredUserName, UserRole } from '@/lib/auth';

interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  status: 'Todo' | 'In-Progress' | 'Completed' | 'On-Hold';
  start_date: string | null;
  estimation_date: string | null;
  closed_date: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const displayName = getStoredUserName() || 'User';

  useEffect(() => {
    setUserRole(getStoredUserRole());
  }, []);

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

  const handleCreateOrEditProject = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects/', data);
        toast.success('Project created successfully!');
      }
      setRefreshTrigger(prev => prev + 1);
      setEditingProject(null);
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save project");
      throw error;
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
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
    <DashboardLayout userName={displayName}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Member Info Banner */}
        {userRole === 'Member' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div>
              <h3 className="font-semibold text-blue-900">Member Access</h3>
              <p className="text-sm text-blue-800">You can view projects you're a member of, but only admins can create or edit projects.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              Projects
            </h1>
            <p className="text-gray-500 font-medium">
              {userRole === 'Member' 
                ? 'Your assigned projects.' 
                : 'Manage all your team\'s ongoing projects.'
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
            {userRole === 'Admin' && (
              <Button 
                variant="primary" 
                onClick={openCreateModal}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#7199D6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md border-none"
              >
                <Plus className="w-5 h-5 mr-1" />
                New Project
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader size="lg" text="Loading projects..." />
            </div>
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
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      project.status === 'In-Progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      project.status === 'On-Hold' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {project.status || 'Todo'}
                    </span>
                  </div>
                </div>
                
                {/* Dates display (ClickUp inspired) */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.start_date && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {project.estimation_date && (
                    <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      Est: {new Date(project.estimation_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2 mb-4">
                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px] flex-1">{project.description}</p>
                  
                  {/* Actions appear on hover - only for Admins */}
                  {userRole === 'Admin' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      title="Delete Project"
                        >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <Button variant="secondary" className="w-full text-sm" onClick={() => router.push(`/projects/${project.id}`)}>View Board</Button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrEditProject}
        initialData={editingProject ? { 
          title: editingProject.title, 
          description: editingProject.description,
          status: editingProject.status,
          start_date: editingProject.start_date,
          estimation_date: editingProject.estimation_date,
          closed_date: editingProject.closed_date,
        } : undefined}
      />
    </DashboardLayout>
  );
}
