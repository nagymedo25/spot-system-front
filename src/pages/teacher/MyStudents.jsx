import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom'; // <-- استيراد الهوك
import api from '/src/lib/api.js';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import DeleteModal from '../../components/common/DeleteModal.jsx';

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
        className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 w-full max-w-lg"
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

const MyStudents = () => {
  // --- استخدام البيانات من الأب (TeacherDashboard) ---
  const { students, loadingStudents, fetchStudents } = useOutletContext(); 
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const initialFormState = { id: null, name: '', code: '' };
  const [currentStudent, setCurrentStudent] = useState(initialFormState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- تم حذف fetchStudents() و useEffect() من هنا ---

  const handleOpenAddModal = () => {
    setCurrentStudent(initialFormState);
    setFormError('');
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (student) => {
    setCurrentStudent(student); 
    setFormError('');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setCurrentStudent(initialFormState);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      if (modalMode === 'add') {
        await api.post('/teacher/students', { name: currentStudent.name, code: currentStudent.code });
      } else {
        await api.put(`/teacher/students/${currentStudent.id}`, { name: currentStudent.name, code: currentStudent.code });
      }
      handleCloseModal();
      fetchStudents(); // <-- استدعاء دالة التحديث من الأب
    } catch (err) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الطالب.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      await api.delete(`/teacher/students/${deleteModal.id}`);
      fetchStudents(); // <-- استدعاء دالة التحديث من الأب
      handleCloseDeleteModal();
    } catch (err) {
      setError('فشل في حذف الطالب.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">إدارة طلابي</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 py-2 px-5 rounded-lg text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all shadow-cyan-glow"
        >
          <FaPlus /> إضافة طالب جديد
        </button>
      </div>
      
      {/* (ملاحظة: مؤشر التحميل الرئيسي موجود الآن في الأب) */}
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
      
      {!loadingStudents && !error && (
        <div className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 overflow-x-auto">
          <table className="w-full min-w-max text-right">
            {/* ... (نفس كود Thead) ... */}
            <thead className="bg-spot-dark/50">
              <tr>
                <th className="p-4 text-white font-semibold">كود الطالب</th>
                <th className="p-4 text-white font-semibold">اسم الطالب</th>
                <th className="p-4 text-white font-semibold">تاريخ الإضافة</th>
                <th className="p-4 text-white font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spot-blue/30">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-spot-dark/70 transition-colors">
                  <td className="p-4 text-spot-cyan font-mono">{student.code}</td>
                  <td className="p-4 text-white">{student.name}</td>
                  <td className="p-4 text-spot-light">
                    {new Date(student.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4 space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleOpenEditModal(student)}
                      className="text-spot-cyan hover:text-spot-cyan-dark p-2 rounded-md transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(student.id)}
                      className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-center p-6 text-spot-light">لا يوجد طلاب لعرضهم. قم بإضافة طالب جديد.</p>}
        </div>
      )}

      {/* ... (Modal إضافة/تعديل - لا تغيير) ... */}
      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === 'add' ? 'إضافة طالب جديد' : 'تعديل بيانات الطالب'}
              </h2>
              <button onClick={handleCloseModal} className="text-spot-light hover:text-white" disabled={isSubmitting}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-spot-light mb-2">كود الطالب</label>
                <input type="text" name="code" value={currentStudent.code} onChange={handleFormChange} required className="w-full input-style" />
              </div>
              <div>
                <label className="block text-sm font-medium text-spot-light mb-2">اسم الطالب</label>
                <input type="text" name="name" value={currentStudent.name} onChange={handleFormChange} required className="w-full input-style" />
              </div>

              {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
              
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="py-2 px-5 rounded-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all">
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    modalMode === 'add' ? 'حفظ الطالب' : 'حفظ التعديلات'
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      
      {/* ... (Modal الحذف - لا تغيير) ... */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="حذف الطالب"
        message="هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع التقارير المرتبطة به بشكل دائم."
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

export default MyStudents;