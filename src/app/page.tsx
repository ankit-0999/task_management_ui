'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TaskBoard } from '@/components/TaskBoard';
import { Button } from '@/components/Button';
import { CreateTaskModal, TaskFormData } from '@/components/CreateTaskModal';
import { Plus } from 'lucide-react';
import api from '@/lib/api';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstProject = async () => {
      try {
        const res = await api.get('/projects/');
        if (res.data && res.data.length > 0) {
          setProjectId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFirstProject();
  }, []);

  const handleCreateTask = async (data: TaskFormData) => {
    if (!projectId) {
      toast.error("Please create a project first!");
      return;
    }
    try {
      await api.post('/tasks/', {
        ...data,
        project_id: projectId,
      });
      // Trigger a re-fetch in the TaskBoard component
      setRefreshTrigger(prev => prev + 1);
      toast.success('Task created successfully!');
    } catch (error: any) {
      console.error("Failed to create task", error);
      toast.error(error.response?.data?.detail || "Failed to create task");
      throw error; // Let react-hook-form handle the loading state rejection
    }
  };

  return (
    <DashboardLayout userName="Ankit">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              Frontend Development
            </h1>
            <p className="text-gray-500 font-medium">Track and manage your team's tasks efficiently.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none bg-indigo-50 text-[#7199D6] hover:bg-indigo-100 border border-indigo-100">
              Settings
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#7199D6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md border-none"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Task
            </Button>
          </div>
        </div>

        {/* Task Board Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Current Sprint</h2>
            <div className="flex gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Live Board</span>
            </div>
          </div>
          
          {projectId ? (
            <TaskBoard projectId={projectId} refreshTrigger={refreshTrigger} />
          ) : (
            <div className="text-center p-10 text-gray-500">
              <p>No projects available. Please go to Projects to create one first.</p>
            </div>
          )}
        </div>

      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateTask}
      />
    </DashboardLayout>
  );
}
