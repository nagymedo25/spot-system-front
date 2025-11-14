import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import ParticlesBackground from '../../components/common/ParticlesBackground';
import { motion } from 'framer-motion';

const ReportTable = ({ data }) => {
  if (!data || !data.columns || !data.rows) {
    return <p className="text-spot-light">لا توجد بيانات لعرضها.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-spot-blue">
      <table className="w-full min-w-max text-right">
        <thead className="bg-spot-darker">
          <tr>
            <th className="p-4 text-white font-semibold"> </th>
            {data.columns.map((col, index) => (
              <th key={index} className="p-4 text-white font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-spot-dark/50">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-spot-blue">
              <td className="p-4 font-semibold text-spot-light">{row.rowName}</td>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4 text-white">{cell || 'N/A'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportView = () => {
  const location = useLocation();
  const { teacher } = location.state || {};

  const [studentCode, setStudentCode] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!teacher) {
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
    setReports([]);
    try {
      const res = await api.post('/public/query-report', {
        teacher_id: teacher.id,
        student_code: studentCode,
      });
      if (res.data.length === 0) {
        setError('لم يتم العثور على تقارير لهذا الكود.');
      }
      setReports(res.data);
    } catch (err) {
      setError('حدث خطأ أثناء البحث. تأكد من الكود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spot-dark">
      <ParticlesBackground />
      <Navbar />
      
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            تقارير الطالب لدى: <span className="text-spot-cyan">{teacher.name}</span>
          </h1>
          <p className="text-xl text-spot-light mb-8">التخصص: {teacher.specialty}</p>

          <form onSubmit={handleSubmit} className="mb-10 p-6 bg-spot-darker rounded-lg shadow-lg border border-spot-blue">
            <label htmlFor="studentCode" className="block text-lg font-medium text-spot-light mb-3">
              الرجاء إدخال كود الطالب
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="studentCode"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                className="flex-grow px-4 py-3 bg-spot-dark text-white border border-spot-blue rounded-lg focus:ring-2 focus:ring-spot-cyan focus:border-spot-cyan outline-none transition-all"
                placeholder="أدخل الكود هنا..."
              />
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 rounded-lg shadow-sm text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spot-cyan transition-all disabled:opacity-50"
              >
                {loading ? 'جارِ البحث...' : 'استعلام'}
              </button>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </form>

          <div className="space-y-8">
            {reports.map(report => (
              <motion.div 
                key={report.id}
                className="bg-spot-darker p-6 rounded-lg shadow-xl border border-spot-blue"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{report.title || 'تقرير أسبوعي'}</h3>
                <p className="text-spot-light mb-4">
                  تاريخ بدء الأسبوع: {new Date(report.week_start_date).toLocaleDateString('ar-EG')}
                </p>
                <ReportTable data={report.data_json} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportView;