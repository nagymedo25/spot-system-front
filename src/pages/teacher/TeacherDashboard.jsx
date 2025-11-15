import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';
import ParticlesBackground from '../../components/common/ParticlesBackground.jsx';
import useAuth from '../../hooks/useAuth.js';
import TeacherNav from '../../components/layout/TeacherNav.jsx';
import api from '/src/lib/api.js';
import { FaSpinner } from 'react-icons/fa';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // دالة لجلب الطلاب، سيتم تمريرها للأبناء لتحديث القائمة
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await api.get('/teacher/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students in dashboard", err);
      // يمكن إضافة رسالة خطأ هنا
    } finally {
      setLoadingStudents(false);
    }
  };

  // جلب الطلاب مرة واحدة عند تحميل الداشبورد
  useEffect(() => {
    fetchStudents();
  }, []);

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-spot-dark text-spot-light">
      <ParticlesBackground />
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <TeacherNav /> 
        
        {loadingStudents ? (
          <div className="text-center p-20">
            <FaSpinner className="animate-spin text-spot-cyan text-5xl mx-auto" />
            <p className="mt-4 text-lg">جاري تحميل بيانات الطلاب...</p>
          </div>
        ) : (
          // تمرير الطلاب ودالة التحديث إلى الأبناء (MyStudents, CreateReport)
          <Outlet context={{ students, loadingStudents, fetchStudents }} /> 
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;