'use client';

import React, { useEffect, useState, use } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader } from '@/components/Loader';
import { TaskBoard } from '@/components/TaskBoard';
import { Button } from '@/components/Button';
import { Plus, ArrowLeft } from 'lucide-react';
import { CreateTaskModal, TaskFormData } from '@/components/CreateTaskModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getStoredUserName } from '@/lib/auth';

interface ProjectBoardProps {
  params: Promise<{ id: string }>;
}

export default function ProjectBoardPage({ params }: ProjectBoardProps) {
  const router = useRouter();
  const { id } = use(params);
  const displayName = getStoredUserName() || 'User';
  
  const [project, setProject] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error('Failed to load project details', err);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleCreateOrEditTask = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          ...data,
          project_id: id,
        });
        toast.success('Task updated successfully!');
      } else {
        await api.post('/tasks/', {
          ...data,
          project_id: id,
        });
        toast.success('Task created successfully!');
      }
      setRefreshTrigger(prev => prev + 1);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save task", error);
      toast.error(error.response?.data?.detail || "Failed to save task");
      throw error; 
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask({
      ...task,
      project_id: String(id),
      assignee_id: task.assignee_id ? String(task.assignee_id) : '',
    });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout userName={displayName}>
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader size="lg" text="Loading project..." />
        </div>
      ) : (
      <div className="max-w-7xl mx-auto space-y-6">
        
        <button 
          onClick={() => router.push('/projects')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-[#7199D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              {project?.title} Board
            </h1>
            <p className="text-gray-500 font-medium">{project?.description || 'Project Task Board'}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
            <Button 
              variant="primary" 
              onClick={openCreateModal}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#7199D6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md border-none"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Task
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          <TaskBoard projectId={id} refreshTrigger={refreshTrigger} onEditTask={openEditModal} />
        </div>
      </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }} 
        onSubmit={handleCreateOrEditTask}
        initialData={editingTask}
      />
    </DashboardLayout>
  );
}
