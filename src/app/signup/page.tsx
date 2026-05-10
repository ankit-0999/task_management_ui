'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginIllustration } from '@/components/LoginIllustration';
import { Button } from '@/components/Button';
import api from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create account
      await api.post('/signup', {
        name,
        email,
        password,
        role
      });
      
      // 2. Automatically login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await api.post('/login/access-token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', loginRes.data.access_token);
      if (loginRes.data.user?.role) {
        localStorage.setItem('role', loginRes.data.user.role);
      }
      if (loginRes.data.user?.name) {
        localStorage.setItem('user_name', loginRes.data.user.name);
      }
      router.push('/');
    } catch (err: any) {
      let errorMessage = 'Failed to sign up';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0]?.msg || 'Validation error';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse bg-gray-50">
      <LoginIllustration 
        title="Join Our Platform" 
        subtitle="Create an account to start collaborating with your team and crushing your goals." 
      />
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
            <p className="text-gray-500 mt-2">Create your new account in seconds.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7199D6] focus:border-[#7199D6] transition-colors outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7199D6] focus:border-[#7199D6] transition-colors outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7199D6] focus:border-[#7199D6] transition-colors outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7199D6] focus:border-[#7199D6] transition-colors outline-none bg-white"
              >
                <option value="Member">Team Member</option>
                <option value="Admin">Project Manager (Admin)</option>
              </select>
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-[#7199D6] hover:bg-[#5a80bf] text-white">
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account? <Link href="/login" className="font-medium text-[#7199D6] hover:text-blue-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
