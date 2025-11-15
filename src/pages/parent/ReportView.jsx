import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '/src/lib/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import ParticlesBackground from '../../components/common/ParticlesBackground.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaSpinner, FaTimes, FaFileAlt } from 'react-icons/fa';
import PlaceholderImg from '../../assets/images/image4.jpeg';

// --- مكون الجدول المذهل (جديد) ---
const ReportTable = ({ data }) => {
  if (!data || !data.columns || !data.rows || data.rows.length === 0) {
    return <p className="text-spot-light/70 text-center p-4">لا توجد بيانات مسجلة في هذا التقرير.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-spot-blue/30">
      <table className="w-full min-w-max text-right">
        <thead className="bg-spot-dark/50">
          <tr>
            <th className="p-4 text-white font-semibold w-40"> </th>
            {data.columns.map((col, index) => (
              <th key={index} className="p-4 text-white font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-spot-blue/50">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-spot-dark/70 transition-colors">
              <td className="p-4 font-semibold text-spot-cyan align-top">{row.rowName}</td>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4 text-white align-top whitespace-pre-wrap min-w-[150px]">
                  {cell || <span className="text-spot-light/30">N/A</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- متغيرات الأنيميشن ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // تأثير تتابع ظهور العناصر
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};

// --- المكون الرئيسي ---
const ReportView = () => {
  const location = useLocation();
  const { teacher } = location.state || {}; // جلب بيانات المعلم

  const [studentCode, setStudentCode] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false); // لتتبع إذا ما تم البحث

  if (!teacher) {
    // ... (صفحة الخطأ - لا تغيير)
    return (
      <div className="min-h-screen bg-spot-dark text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">خطأ: لم يتم تحديد المعلم.</h2>
        <Link to="/" className="text-spot-cyan hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);
    setReports([]);
    try {
      const res = await api.post('/public/query-report', {
        teacher_id: teacher.id,
        student_code: studentCode,
      });
      if (res.data.length === 0) {
        setError('لم يتم العثور على تقارير لهذا الكود. تأكد من الكود المدخل.');
      }
      setReports(res.data);
    } catch (err) {
      setError('حدث خطأ أثناء البحث. تأكد من الكود أو حاول لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spot-dark">
      <ParticlesBackground />
      <Navbar />
      
      <motion.div 
        className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* --- 1. معلومات المعلم الأنيقة --- */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30"
        >
          <img 
            src={teacher.avatar_url || PlaceholderImg} 
            alt={teacher.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-spot-cyan shadow-cyan-glow"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              تقارير الطالب لدى: <span className="text-spot-cyan">{teacher.name}</span>
            </h1>
            <p className="text-2xl text-spot-light">{teacher.specialty}</p>
          </div>
        </motion.div>

        {/* --- 2. فورم البحث --- */}
        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit} 
          className="mb-10 p-6 bg-spot-darker rounded-lg shadow-lg border border-spot-blue/30"
        >
          <label htmlFor="studentCode" className="block text-lg font-medium text-spot-light mb-3">
            الرجاء إدخال كود الطالب
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                id="studentCode"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-spot-dark text-white border border-spot-blue/50 rounded-lg focus:ring-2 focus:ring-spot-cyan focus:border-spot-cyan outline-none transition-all pr-10"
                placeholder="أدخل الكود هنا..."
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spot-light/50" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-8 rounded-lg shadow-sm text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spot-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جارِ البحث...</span>
                </>
              ) : (
                'استعلام'
              )}
            </button>
          </div>
        </motion.form>

        {/* --- 3. عرض النتائج (التقارير) --- */}
        <AnimatePresence>
          {loading && (
            <motion.div variants={itemVariants} className="text-center p-10">
              <FaSpinner className="animate-spin text-spot-cyan text-5xl mx-auto" />
            </motion.div>
          )}

          {error && (
            <motion.div 
              variants={itemVariants} 
              className="flex items-center justify-center gap-3 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-500/50"
            >
              <FaTimes />
              <span>{error}</span>
            </motion.div>
          )}

          {!loading && !error && reports.length === 0 && searched && (
             <motion.div 
              variants={itemVariants} 
              className="flex items-center justify-center gap-3 p-6 bg-spot-darker text-spot-light rounded-lg border border-spot-blue/30"
            >
              <FaFileAlt />
              <span>لا توجد تقارير لعرضها لهذا الكود.</span>
            </motion.div>
          )}

          {!loading && !error && reports.length > 0 && (
            <motion.div 
              className="space-y-8"
              variants={containerVariants} // حاوية جديدة لتأثير التتابع
              initial="hidden"
              animate="visible"
            >
              {reports.map(report => (
                <motion.div 
                  key={report.id}
                  className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30"
                  variants={itemVariants} // أنيميشن لكل بطاقة تقرير
                >
                  <div className="p-4 bg-spot-dark/50 rounded-t-lg">
                    <h3 className="text-2xl font-bold text-white mb-1">{report.title || 'تقرير أسبوعي'}</h3>
                    <p className="text-spot-light">
                      {/* === (الإصلاح) === */}
                      تاريخ بدء الأسبوع: {new Date(report.week_start_date).toLocaleDateString('ar-EG')}
                    </p>
                    {/* === (نهاية الإصلاح) === */}
                  </div>
                  <ReportTable data={report.data_json} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReportView;