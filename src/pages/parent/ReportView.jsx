import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '/src/lib/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import ParticlesBackground from '../../components/common/ParticlesBackground.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// [تعديل] إضافة مكتبات الـ PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// [تعديل] إزالة أيقونات العداد
import { FaSearch, FaSpinner, FaTimes, FaFileAlt, FaFilePdf } from 'react-icons/fa';
import PlaceholderImg from '../../assets/images/image4.jpeg';
import Logo from '../../assets/images/Logo.png';

// --- (مكون الجدول والأنيميشن - لا تغيير) ---
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};
const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};
const ReportTable = ({ data }) => {
  if (!data || !data.columns || !data.rows || data.rows.length === 0) {
    return <p className="text-spot-light/70 text-center p-4">لا توجد بيانات مسجلة في هذا التقرير.</p>;
  }
  return (
    <div className="responsive-table-container">
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
          <AnimatePresence>
            <motion.tbody 
              className="divide-y divide-spot-blue/50"
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.rows.map((row, rowIndex) => (
                <motion.tr 
                  key={rowIndex} 
                  className="hover:bg-spot-dark/70 transition-colors"
                  variants={rowVariants}
                >
                  <td data-label="المهمة" className="p-4 font-semibold text-spot-cyan align-top">{row.rowName}</td>
                  {row.cells.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      data-label={data.columns[cellIndex]}
                      className="p-4 text-white align-top whitespace-pre-wrap min-w-[150px]"
                    >
                      {cell || <span className="text-spot-light/30">N/A</span>}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
};

// --- المكون الرئيسي ---
const ReportView = () => {
  const location = useLocation();
  const { teacher } = location.state || {};

  const [studentCode, setStudentCode] = useState('');
  // reportsList now holds the report objects including the new 'report_identifier'
  const [reportsList, setReportsList] = useState([]); 
  const [selectedReport, setSelectedReport] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');

  const [isDownloading, setIsDownloading] = useState(false);
  
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
    setSearched(true);
    setReportsList([]);
    setSelectedReport(null);
    setSelectedReportId('');
    try {
      // The backend now returns a list of reports with 'report_identifier'
      const res = await api.post('/public/query-report', {
        teacher_id: teacher.id,
        student_code: studentCode,
      });
      
      if (res.data.length === 0) {
        setError('لم يتم العثور على تقارير لهذا الكود. تأكد من الكود المدخل.');
      } else {
        setReportsList(res.data);
        // Automatically select the newest report (first in the DESC updated_at list)
        setSelectedReport(res.data[0]); 
        setSelectedReportId(res.data[0].id);
      }
    } catch (err) {
      setError('حدث خطأ أثناء البحث. تأكد من الكود أو حاول لاحقاً.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle report selection from the new dropdown
  const handleReportSelectChange = (e) => {
    const reportId = e.target.value;
    setSelectedReportId(reportId);
    if (reportId) {
      const report = reportsList.find(r => r.id == reportId);
      setSelectedReport(report);
    } else {
      setSelectedReport(null);
    }
  };
  
  // [تعديل جذري] دالة التحميل المباشر كـ PDF
  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    
    const reportId = selectedReport.id;
    const reportElement = document.getElementById(`report-${reportId}`);
    const teacherInfoElement = document.querySelector('.teacher-info-card');
    if (!reportElement || !teacherInfoElement) return;

    setIsDownloading(true);

    // إضافة الكلاسات مؤقتاً لتطبيق تنسيقات "الطباعة"
    document.body.classList.add('is-printing');
    reportElement.classList.add('print-this-report');
    teacherInfoElement.classList.add('print-this-report');

    try {
      // استخدام html2canvas لالتقاط العناصر بتنسيقاتها
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 portrait
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // 1. التقاط بطاقة المعلم
      const teacherCanvas = await html2canvas(teacherInfoElement, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff'
      });
      const teacherImgData = teacherCanvas.toDataURL('image/png');
      const teacherImgProps = pdf.getImageProperties(teacherImgData);
      const teacherImgHeight = (teacherImgProps.height * pdfWidth) / teacherImgProps.width;
      
      pdf.addImage(teacherImgData, 'PNG', 0, 0, pdfWidth, teacherImgHeight);
      
      // 2. التقاط التقرير
      const reportCanvas = await html2canvas(reportElement, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff'
      });
      const reportImgData = reportCanvas.toDataURL('image/png');
      
      pdf.addPage();
      pdf.addImage(reportImgData, 'PNG', 0, 0, pdfWidth, 0); // 0 height will auto-calculate based on width

      // 3. الحفظ
      const safeReportName = selectedReport.report_identifier.replace(/[^a-z0-9]/gi, '_');
      const fileName = `Report-${teacher.name.replace(' ', '_')}-${studentCode || 'student'}-${safeReportName}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("فشل إنشاء ملف الـ PDF. حاول مرة أخرى.");
    } finally {
      // إزالة الكلاسات في كل الأحوال
      document.body.classList.remove('is-printing');
      setIsDownloading(false);
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
        
        {/* --- 1. معلومات المعلم --- */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.01, borderColor: '#00f0ff' }}
          className="teacher-info-card flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 transition-all"
        >
          {/* لوجو للطباعة فقط */}
          <img 
            src={Logo} 
            alt="SPOT Logo" 
            className="print-logo"
          />
          <img 
            src={teacher.avatar_url || PlaceholderImg} 
            alt={teacher.name}
            className="teacher-avatar-print w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-spot-cyan shadow-cyan-glow"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              تقارير الطالب لدى: <span className="text-spot-cyan">{teacher.name}</span>
            </h1>
            <p className="text-xl md:text-2xl text-spot-light">{teacher.specialty}</p>
          </div>
        </motion.div>

        {/* --- 2. فورم البحث --- */}
        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit} 
          className="report-search-form mb-10 p-6 bg-spot-darker rounded-lg shadow-lg border border-spot-blue/30"
        >
          <label htmlFor="studentCode" className="block text-lg font-medium text-spot-light mb-3">
            الرجاء إدخال كود الطالب
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <motion.input
                id="studentCode"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-spot-dark text-white border border-spot-blue/50 rounded-lg focus:ring-2 focus:ring-spot-cyan focus:border-spot-cyan outline-none transition-all pr-10"
                placeholder="أدخل الكود هنا..."
                whileFocus={{ 
                  scale: 1.02, 
                  borderColor: '#00f0ff', 
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' 
                }}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spot-light/50" />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="py-3 px-8 rounded-lg shadow-sm text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spot-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ 
                scale: loading ? 1 : 1.05, 
                boxShadow: loading ? 'none' : '0 0 15px rgba(0, 240, 255, 0.5)' 
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جارِ البحث...</span>
                </>
              ) : (
                'استعلام'
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* --- 3. عرض النتائج (قائمة التقارير) --- */}
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

          {!loading && !error && searched && (
            <motion.div 
              className="space-y-8"
              variants={containerVariants} 
              initial="hidden"
              animate="visible"
            >
              {reportsList.length === 0 ? (
                 <motion.div 
                  variants={itemVariants} 
                  className="flex items-center justify-center gap-3 p-6 bg-spot-darker text-spot-light rounded-lg border border-spot-blue/30"
                >
                  <FaFileAlt />
                  <span>لا توجد تقارير لعرضها لهذا الكود.</span>
                </motion.div>
              ) : (
                <div className="report-selector mb-8 p-6 bg-spot-darker rounded-lg shadow-lg border border-spot-blue/30">
                  <label htmlFor="report-select" className="block text-lg font-medium text-spot-light mb-3">
                    اختيار التقرير الأسبوعي
                  </label>
                  <select
                    id="report-select"
                    value={selectedReportId}
                    onChange={handleReportSelectChange}
                    className="w-full px-4 py-3 bg-spot-dark text-white border border-spot-blue/50 rounded-lg focus:ring-2 focus:ring-spot-cyan focus:border-spot-cyan outline-none transition-all"
                  >
                    {reportsList.map(report => (
                      <option key={report.id} value={report.id}>
                        {report.title} - (معرّف التقرير: {report.report_identifier})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* --- عرض التقرير المحدد --- */}
              {selectedReport && (
                <motion.div 
                  key={selectedReport.id}
                  id={`report-${selectedReport.id}`}
                  className="report-card-container bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30"
                  variants={itemVariants}
                >
                  <div className="p-4 bg-spot-dark/50 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{selectedReport.title || 'تقرير أسبوعي'}</h3>
                      <div className="text-sm font-medium text-spot-light">
                          معرّف التقرير: <span className='text-spot-cyan'>{selectedReport.report_identifier}</span>
                      </div>
                      
                      {/* زر التحميل المباشر */}
                      <motion.button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="print-pdf-button flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-spot-cyan bg-spot-dark hover:bg-spot-blue transition-all border border-spot-blue disabled:opacity-50"
                        whileHover={{ scale: isDownloading ? 1 : 1.05, color: isDownloading ? '' : '#e0f4f4' }}
                      >
                        {isDownloading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>جاري الإنشاء...</span>
                          </>
                        ) : (
                          <>
                            <FaFilePdf />
                            <span>تحميل كـ PDF</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <ReportTable data={selectedReport.data_json} />
                </motion.div>
              )}
              {/* --- نهاية عرض التقرير المحدد --- */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReportView;