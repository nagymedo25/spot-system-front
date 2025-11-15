import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import api from '/src/lib/api.js';
import { FaEdit, FaTrash, FaSpinner, FaSearch, FaFileAlt } from 'react-icons/fa';
import DeleteModal from '../../components/common/DeleteModal.jsx';

const ManageReports = () => {
  const { students, loadingStudents } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // قراءة حالة الطالب المبدئية عند التوجيه من صفحة CreateReport
  const initialStudentId = location.state?.initialStudentId || '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fetchReports = async (studentId) => {
    if (!studentId) {
      setReports([]);
      return;
    }
    setError('');
    setLoadingReports(true);
    try {
      // Backend now returns `report_identifier`
      const res = await api.get('/teacher/reports/list', {
        params: { student_id: studentId }
      });
      setReports(res.data);
    } catch (err) {
      setError('فشل في جلب قائمة التقارير.');
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };
  
  useEffect(() => {
    fetchReports(selectedStudentId);
  }, [selectedStudentId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);
  
  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id: id });
  };
  
  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModal({ isOpen: false, id: null });
  };
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/teacher/reports/${deleteModal.id}`);
      handleCloseDeleteModal();
      fetchReports(selectedStudentId); // Refresh the list
    } catch (err) {
      setError('فشل في حذف التقرير.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEditReport = (report) => {
    // Pass the Report ID and the custom identifier to the CreateReport page
    navigate('/teacher/report', { 
        state: { 
            isEditMode: true, 
            studentId: selectedStudentId,
            reportId: report.id,
            reportIdentifier: report.report_identifier // Pass the custom identifier string
        } 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">إدارة التقارير الأسبوعية</h1>
      
      {/* Student Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-spot-darker p-4 rounded-lg border border-spot-blue/30">
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
          <option value="">{loadingStudents ? '...' : '-- اختر الطالب لعرض تقاريره --'}</option>
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <option key={student.id} value={student.id}>{student.name} ({student.code})</option>
            ))
          ) : (
            <option disabled>لا توجد نتائج بحث</option>
          )}
        </select>
      </div>

      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center mb-8">{error}</p>}
      
      {selectedStudentId && loadingReports && (
        <div className="text-center p-10"><FaSpinner className="animate-spin text-spot-cyan text-4xl mx-auto" /></div>
      )}
      
      {selectedStudentId && !loadingReports && reports.length === 0 && (
        <div className="flex items-center justify-center gap-3 p-6 bg-spot-darker text-spot-light rounded-lg border border-spot-blue/30">
          <FaFileAlt />
          <span>لا توجد تقارير محفوظة لهذا الطالب.</span>
        </div>
      )}
      
      {selectedStudentId && !loadingReports && reports.length > 0 && (
        <div className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 overflow-x-auto">
          <table className="w-full min-w-max text-right">
            <thead className="bg-spot-dark/50">
              <tr>
                <th className="p-4 text-white font-semibold">عنوان التقرير</th>
                <th className="p-4 text-white font-semibold">اسم الأسبوع/المعرّف</th>
                <th className="p-4 text-white font-semibold">آخر تحديث</th>
                <th className="p-4 text-white font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spot-blue/30">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-spot-dark/70 transition-colors">
                  <td className="p-4 text-white font-medium">{report.title}</td>
                  <td className="p-4 text-spot-cyan">
                    {report.report_identifier} 
                  </td>
                  <td className="p-4 text-spot-light">
                    {new Date(report.updated_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-4 space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleEditReport(report)}
                      className="text-spot-cyan hover:text-spot-cyan-dark p-2 rounded-md transition-colors"
                      title="تعديل التقرير"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(report.id)}
                      className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors"
                      title="حذف التقرير"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="حذف التقرير"
        message="هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء."
      />

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
      `}</style>
    </motion.div>
  );
};

export default ManageReports;