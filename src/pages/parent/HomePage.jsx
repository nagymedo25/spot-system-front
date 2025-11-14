import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ParticlesBackground from '../../components/common/ParticlesBackground';
import TeacherCard from '../../components/parent/TeacherCard';

const HomePage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/public/teachers');
        setTeachers(res.data);
      } catch (err) {
        setError('فشل في تحميل بيانات المعلمين.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-spot-dark">
      <ParticlesBackground />
      <Navbar />
      
      <header className="h-[40vh] flex items-center justify-center text-center p-4 relative">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 [text-shadow:_0_0_15px_rgba(0,240,255,0.5)]">
            المعلمون المتاحون
          </h1>
          <p className="text-xl md:text-2xl text-spot-light font-light max-w-2xl mx-auto">
            قف بالماوس على المعلم لإظهار التفاصيل.
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {loading && <p className="text-center text-spot-light text-xl">جارِ التحميل...</p>}
        {error && <p className="text-center text-red-400 text-xl">{error}</p>}
        
        {!loading && !error && (
          <div className="teacher-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center [perspective:1000px]">
            {teachers.map(teacher => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;