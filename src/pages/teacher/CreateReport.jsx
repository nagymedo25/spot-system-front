import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom'; // <-- استيراد الهوك
import api from '/src/lib/api.js';
import { FaPlus, FaTrash, FaSpinner, FaCheck, FaTimes, FaSave, FaSearch } from 'react-icons/fa';

// ... (Modal Component - لا تغيير)
const Modal = ({ children, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 w-full max-w-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const CreateReport = () => {
  // --- استخدام البيانات من الأب (TeacherDashboard) ---
  const { students, loadingStudents } = useOutletContext(); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const SINGLE_REPORT_DATE = '2000-01-01';

  const [reportId, setReportId] = useState(null);
  const [reportTitle, setReportTitle] = useState('التقرير الشامل');
  const [reportData, setReportData] = useState({
    columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    rows: [],
  });

  const [loadingReport, setLoadingReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [formError, setFormError] = useState('');

  // --- تم حذف fetchStudents() و useEffect() الخاص بها من هنا ---

  // ... (Load Report Logic - لا تغيير)
  const fetchReport = useCallback(async () => {
    if (!selectedStudentId) return;
    
    setLoadingReport(true);
    setReportId(null);
    setIsDirty(false);
    setNotification({ type: '', message: '' });
    try {
      const res = await api.get('/teacher/reports', {
        params: { student_id: selectedStudentId, week_start: SINGLE_REPORT_DATE }
      });
      
      if (res.data.length > 0) {
        const report = res.data[0];
        setReportData(report.data_json);
        setReportTitle(report.title || 'التقرير الشامل');
        setReportId(report.id);
      } else {
        setReportData({
          columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
          rows: [],
        });
        setReportTitle('التقرير الشامل');
      }
    } catch (err) {
      console.error("Failed to fetch report", err);
      setNotification({ type: 'error', message: 'فشل في تحميل التقرير.' });
    } finally {
      setLoadingReport(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ... (Manual Save Function - لا تغيير)
  const handleSave = async () => {
    if (!selectedStudentId || isSaving) return;

    setIsSaving(true);
    setNotification({ type: '', message: '' });
    try {
      const res = await api.post('/teacher/reports', {
        report_id: reportId,
        student_id: selectedStudentId,
        week_start_date: SINGLE_REPORT_DATE,
        title: reportTitle,
        data_json: reportData,
      });
      
      setReportId(res.data.id);
      setIsDirty(false);
      setNotification({ type: 'success', message: 'تم الحفظ بنجاح!' });
    } catch (err) {
      console.error("Save failed", err);
      setNotification({ type: 'error', message: 'حدث خطأ أثناء الحفظ.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    }
  };

  // ... (Handlers for Table - لا تغيير)
  const handleTitleChange = (value) => {
    setReportTitle(value);
    setIsDirty(true);
  };

  const handleCellChange = (rowIndex, cellIndex, value) => {
    const newRows = [...reportData.rows];
    newRows[rowIndex].cells[cellIndex] = value;
    setReportData({ ...reportData, rows: newRows });
    setIsDirty(true);
  };

  const handleRowNameChange = (rowIndex, value) => {
    const newRows = [...reportData.rows];
    newRows[rowIndex].rowName = value;
    setReportData({ ...reportData, rows: newRows });
    setIsDirty(true);
  };
  
  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRowName.trim()) {
      setFormError('اسم الصف مطلوب');
      return;
    }
    const newRow = {
      rowName: newRowName,
      cells: Array(reportData.columns.length).fill('')
    };
    setReportData({ ...reportData, rows: [...reportData.rows, newRow] });
    setIsDirty(true);
    setIsModalOpen(false);
    setNewRowName('');
    setFormError('');
  };

  const handleDeleteRow = (rowIndex) => {
    const newRows = reportData.rows.filter((_, index) => index !== rowIndex);
    setReportData({ ...reportData, rows: newRows });
    setIsDirty(true);
  };

  // ... (Filtered Students for Search - لا تغيير)
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- 1. Header and Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">إنشاء التقرير</h1>
        
        <div className="flex items-center gap-3">
          {notification.message && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`font-medium ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
            >
              {notification.message}
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving || !selectedStudentId}
            className="flex items-center gap-2 py-2 px-6 rounded-lg text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ التقرير'}
          </button>
        </div>
      </div>
      
      {/* --- 2. Student Search and Selector --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <input 
            type="text"
            placeholder="ابحث عن طالب بالاسم أو الكود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-style w-full pl-10"
            disabled={loadingStudents}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spot-light/50" />
        </div>
        <select 
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="input-style w-full"
          disabled={loadingStudents}
        >
          {/* (ملاحظة: مؤشر التحميل الرئيسي موجود الآن في الأب) */}
          <option value="">{loadingStudents ? '...' : '-- اختر الطالب --'}</option>
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <option key={student.id} value={student.id}>{student.name} ({student.code})</option>
            ))
          ) : (
            <option disabled>لا توجد نتائج بحث</option>
          )}
        </select>
      </div>

      {/* --- 3. Report Table --- */}
      {!selectedStudentId ? (
        <div className="text-center p-10 bg-spot-darker rounded-lg border border-spot-blue/30 text-spot-light">
          الرجاء اختيار طالب لبدء تحرير تقريره.
        </div>
      ) : loadingReport ? (
        <div className="text-center p-10"><FaSpinner className="animate-spin text-spot-cyan text-4xl mx-auto" /></div>
      ) : (
        <div className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 overflow-x-auto">
          {/* ... (نفس كود Table و Input title) ... */}
          <input 
            type="text"
            value={reportTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-bold text-white bg-transparent p-4 w-full outline-none focus:bg-spot-dark"
            placeholder="عنوان التقرير"
          />
          <table className="w-full min-w-max text-right">
            <thead className="bg-spot-dark/50">
              <tr>
                <th className="p-4 text-white font-semibold w-40"> </th>
                {reportData.columns.map((col, index) => (
                  <th key={index} className="p-4 text-white font-semibold">{col}</th>
                ))}
                <th className="p-4 w-16"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spot-blue/30">
              <AnimatePresence>
                {reportData.rows.map((row, rowIndex) => (
                  <motion.tr 
                    key={rowIndex}
                    className="hover:bg-spot-dark/70"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="p-2 align-top">
                      <input 
                        type="text"
                        value={row.rowName}
                        onChange={(e) => handleRowNameChange(rowIndex, e.target.value)}
                        className="input-cell font-semibold text-spot-light"
                        placeholder="اسم الصف..."
                      />
                    </td>
                    {row.cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 align-top">
                        <textarea
                          value={cell || ''}
                          onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                          className="input-cell w-full h-24 min-h-[5rem] resize-none"
                          placeholder="..."
                        />
                      </td>
                    ))}
                    <td className="p-2 align-top text-center">
                      <button 
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 w-full p-4 text-center justify-center text-spot-cyan hover:bg-spot-dark transition-colors"
          >
            <FaPlus /> إضافة صف جديد
          </button>
        </div>
      )}

      {/* ... (Modal إضافة صف - لا تغيير) ... */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddRow} className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">إضافة صف جديد</h3>
            <label className="block text-sm font-medium text-spot-light mb-2">اسم الصف</label>
            <input 
              type="text"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              className="w-full input-style"
              placeholder="مثال: الواجبات، السلوك، ..."
              autoFocus
            />
            {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
            <div className="flex justify-end gap-4 pt-4 mt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-5 rounded-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all">
                إلغاء
              </button>
              <button type="submit" className="py-2 px-5 rounded-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all">
                إضافة
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ... (Common Styles - لا تغيير) ... */}
      <style>{`
        .input-style {
          background-color: #101827;
          color: white;
          border: 1px solid #1f4068;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          transition: all 0.2s;
        }
        .input-style:focus {
          outline: none;
          border-color: #00f0ff;
          box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.5);
        }
        .input-cell {
          background: transparent;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          width: 100%;
          outline: none;
        }
        .input-cell:focus {
          background: #101827;
          box-shadow: 0 0 0 1px #00f0ff;
        }
        .input-cell::placeholder {
          color: #e0f4f450;
        }
      `}</style>
    </motion.div>
  );
};

export default CreateReport;