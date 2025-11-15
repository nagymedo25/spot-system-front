import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '/src/lib/api.js'; // تم استخدام المسار المطلق
import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import DeleteModal from '../../components/common/DeleteModal.jsx';

// Modal Component (لإضافة/تعديل)
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
        className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 w-full max-w-2xl"
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

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const initialFormState = { id: null, name: '', specialty: '', email: '', password: '', avatar_url: '' };
  const [currentTeacher, setCurrentTeacher] = useState(initialFormState);
  
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // حالة التحميل للزر
  const [formError, setFormError] = useState('');

  // حالات مودال الحذف
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/teachers');
      setTeachers(res.data);
    } catch (err) {
      setError('فشل في جلب قائمة المعلمين.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentTeacher(initialFormState);
    setFormError('');
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (teacher) => {
    setCurrentTeacher({ ...teacher, password: '' }); 
    setFormError('');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting || uploading) return;
    setIsModalOpen(false);
    setCurrentTeacher(initialFormState);
  };
  
  // تعريف الدالة التي سببت الخطأ
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    setFormError('');
    try {
      const res = await api.post('/admin/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCurrentTeacher(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
    } catch (err) {
      setFormError('فشل في رفع الصورة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      if (modalMode === 'add') {
        await api.post('/admin/teachers', currentTeacher);
      } else {
        const { id, name, specialty, email, avatar_url } = currentTeacher;
        await api.put(`/admin/teachers/${id}`, { name, specialty, email, avatar_url });
      }
      handleCloseModal();
      fetchTeachers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // دوال الحذف الجديدة
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
      await api.delete(`/admin/teachers/${deleteModal.id}`);
      fetchTeachers();
      handleCloseDeleteModal();
    } catch (err) {
      setError('فشل في حذف المعلم.');
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
        <h1 className="text-3xl md:text-4xl font-bold text-white">إدارة المعلمين</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 py-2 px-5 rounded-lg text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all shadow-cyan-glow"
        >
          <FaPlus /> إضافة معلم جديد
        </button>
      </div>
      
      {loading && <div className="text-center p-10"><FaSpinner className="animate-spin text-spot-cyan text-4xl mx-auto" /></div>}
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 overflow-x-auto">
          <table className="w-full min-w-max text-right">
            <thead className="bg-spot-dark/50">
              <tr>
                <th className="p-4 text-white font-semibold">الصورة الرمزية</th>
                <th className="p-4 text-white font-semibold">الاسم</th>
                <th className="p-4 text-white font-semibold">التخصص</th>
                <th className="p-4 text-white font-semibold">البريد الإلكتروني</th>
                <th className="p-4 text-white font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spot-blue/30">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-spot-dark/70 transition-colors">
                  <td className="p-4">
                    <img src={teacher.avatar_url || 'https://placehold.co/150/0c121e/00f0ff?text=SPOT'} alt={teacher.name} className="w-12 h-12 rounded-full object-cover border-2 border-spot-cyan" />
                  </td>
                  <td className="p-4 text-white">{teacher.name}</td>
                  <td className="p-4 text-spot-light">{teacher.specialty}</td>
                  <td className="p-4 text-spot-light">{teacher.email}</td>
                  <td className="p-4 space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleOpenEditModal(teacher)}
                      className="text-spot-cyan hover:text-spot-cyan-dark p-2 rounded-md transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(teacher.id)}
                      className="text-red-500 hover:text-red-400 p-2 rounded-md transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && <p className="text-center p-6 text-spot-light">لا يوجد معلمون لعرضهم. قم بإضافة معلم جديد.</p>}
        </div>
      )}

      {/* مودال إضافة/تعديل */}
      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === 'add' ? 'إضافة معلم جديد' : 'تعديل بيانات المعلم'}
              </h2>
              <button onClick={handleCloseModal} className="text-spot-light hover:text-white" disabled={isSubmitting || uploading}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-spot-light mb-2">الاسم</label>
                  <input type="text" name="name" value={currentTeacher.name} onChange={handleFormChange} required className="w-full input-style" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spot-light mb-2">التخصص</label>
                  <input type="text" name="specialty" value={currentTeacher.specialty} onChange={handleFormChange} required className="w-full input-style" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spot-light mb-2">البريد الإلكتروني</label>
                  <input type="email" name="email" value={currentTeacher.email} onChange={handleFormChange} required className="w-full input-style" />
                </div>
                {modalMode === 'add' && (
                  <div>
                    <label className="block text-sm font-medium text-spot-light mb-2">كلمة المرور</label>
                    <input type="password" name="password" value={currentTeacher.password} onChange={handleFormChange} required className="w-full input-style" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-spot-light mb-2">الصورة الرمزية (Avatar)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-grow flex items-center justify-center gap-2 cursor-pointer p-4 border-2 border-dashed border-spot-blue rounded-lg text-spot-light hover:bg-spot-dark hover:border-spot-cyan">
                    <FaCloudUploadAlt />
                    <span>{uploading ? 'جاري الرفع...' : 'اختر صورة'}</span>
                    <input type="file" onChange={handleFileChange} disabled={uploading || isSubmitting} className="hidden" accept="image/*" />
                  </label>
                  {(uploading || currentTeacher.avatar_url) && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-spot-cyan p-1 relative">
                      {uploading && <FaSpinner className="animate-spin text-white absolute inset-0 m-auto" />}
                      {currentTeacher.avatar_url && <img src={currentTeacher.avatar_url} alt="Preview" className="w-full h-full rounded-full object-cover" />}
                    </div>
                  )}
                </div>
              </div>

              {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
              
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} disabled={isSubmitting || uploading} className="py-2 px-5 rounded-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all">
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || isSubmitting} 
                  className="py-2 px-5 rounded-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    modalMode === 'add' ? 'حفظ المعلم' : 'حفظ التعديلات'
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* مودال الحذف */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="حذف المعلم"
        message="هل أنت متأكد من حذف هذا المعلم؟ سيتم حذف جميع الطلاب والتقارير المرتبطة به بشكل دائم."
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

export default ManageTeachers;