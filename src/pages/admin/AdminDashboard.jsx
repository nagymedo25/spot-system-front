import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ParticlesBackground from '../../components/common/ParticlesBackground';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  // تأكيد إضافي أن المستخدم أدمن
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-spot-dark text-spot-light">
      <ParticlesBackground />
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Outlet سيعرض المكون ابن (مثل ManageTeachers) */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminDashboard;