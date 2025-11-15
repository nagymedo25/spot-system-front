import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import api from '/src/lib/api.js';
import { FaPlus, FaTrash, FaSpinner, FaTimes, FaSave, FaSearch, FaCheck, FaEdit, FaFileAlt } from 'react-icons/fa';

// Helper function to simply pass the identifier string
const formatReportIdentifier = (identifier) => identifier; 

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
  const { students, loadingStudents } = useOutletContext(); 
  const location = useLocation();
  const navigate = useNavigate();

  // --- State for Workflow ---
  const isEditMode = location.state?.isEditMode === true;
  const initialStudentId = location.state?.studentId || '';
  const initialReportId = location.state?.reportId || null;
  const initialIdentifier = location.state?.reportIdentifier || '';

  // Stages: SELECT_STUDENT, CHOOSE_ACTION, PROMPT_IDENTIFIER, CREATE_EDIT_REPORT
  const initialStage = isEditMode && initialStudentId ? 'CREATE_EDIT_REPORT' : (initialStudentId ? 'CHOOSE_ACTION' : 'SELECT_STUDENT');
  const [stage, setStage] = useState(initialStage); 
  // --- End State for Workflow ---
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId); 
  
  const [reportId, setReportId] = useState(initialReportId);
  // New state for the custom identifier (Week Name)
  const [reportIdentifier, setReportIdentifier] = useState(initialIdentifier); 
  const [newIdentifierInput, setNewIdentifierInput] = useState(''); // For the prompt modal
  
  const [reportTitle, setReportTitle] = useState('التقرير الأسبوعي');
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

  const fetchReport = useCallback(async () => {
    // Only proceed to fetch if we are in the editing stage and we have a reportId to load
    if (stage !== 'CREATE_EDIT_REPORT' || !selectedStudentId || !reportId) {
        setReportId(null);
        setReportData({ columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], rows: [] });
        setReportTitle('التقرير الأسبوعي');
        return;
    }
    
    setLoadingReport(true);
    setIsDirty(false);
    setNotification({ type: '', message: '' });
    
    try {
        const params = { report_id: reportId }; // Fetch by ID now

        const res = await api.get('/teacher/reports/single', { params });
        
        if (res.data.length > 0) {
            const report = res.data[0];
            setReportData(report.data_json);
            setReportTitle(report.title || 'التقرير الأسبوعي');
            setReportIdentifier(report.report_identifier); 
            setReportId(report.id); 
            setNotification({ type: 'success', message: 'تم تحميل التقرير المحفوظ بنجاح.' });
        } else {
            // Should not happen if navigate from ManageReports, but handle it
            setReportData({
                columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
                rows: [],
            });
            setReportTitle('التقرير الأسبوعي');
            setReportId(null);
            setNotification({ type: 'error', message: 'لم يتم العثور على التقرير المحدد، الرجاء العودة لإدارة التقارير.' });
        }
    } catch (err) {
        console.error("Failed to fetch report", err);
        setNotification({ type: 'error', message: 'فشل في تحميل التقرير.' });
    } finally {
        setLoadingReport(false);
        // Clear navigation state after successful load/error on initial load
        if (location.state?.isEditMode) {
             navigate(location.pathname, { replace: true, state: {} });
        }
    }
  }, [selectedStudentId, reportId, stage, location.state, navigate, location.pathname]);

  useEffect(() => {
    // Trigger fetch only when entering the CREATE_EDIT_REPORT stage in EDIT mode
    if (stage === 'CREATE_EDIT_REPORT' && reportId) {
        fetchReport();
    }
  }, [stage, reportId, fetchReport]);


  const handleStudentSelectChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    setSearchQuery('');
    
    // Reset report state when choosing a different student
    setReportId(null);
    setReportIdentifier('');
    setReportData({ columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], rows: [] });
    setReportTitle('التقرير الأسبوعي');
    setNotification({ type: '', message: '' });

    if (studentId) {
        setStage('CHOOSE_ACTION');
    } else {
        setStage('SELECT_STUDENT');
    }
  };

  const handleCreateNewReportPrompt = () => {
    // Go to prompt stage
    setStage('PROMPT_IDENTIFIER');
    setNewIdentifierInput('');
    setFormError('');
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    const identifier = newIdentifierInput.trim();
    
    if (!identifier) {
        setFormError('اسم التقرير (المعرّف) مطلوب.');
        return;
    }
    
    // Set identifier and reset report state for new entry
    setReportIdentifier(identifier);
    setReportId(null); // Ensure reportId is null for creation
    setReportData({ columns: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], rows: [] });
    setReportTitle('التقرير الأسبوعي: ' + identifier); // Suggest a title based on identifier
    
    // Move to editing stage
    setStage('CREATE_EDIT_REPORT');
    setNotification({ type: 'warning', message: 'جاري إنشاء تقرير جديد: ' + identifier });
    setFormError('');
  };
  
  const handleManageReports = () => {
      // Redirect to ManageReports for the selected student
      navigate('/teacher/reports/manage', { state: { initialStudentId: selectedStudentId } });
  };


  const handleSave = async () => {
    // Requires a selected student, not saving, in editing stage, and an identifier
    if (!selectedStudentId || isSaving || stage !== 'CREATE_EDIT_REPORT' || !reportIdentifier) return;

    setIsSaving(true);
    setNotification({ type: '', message: '' });
    
    if (reportData.rows.length === 0 || !reportTitle.trim()) {
         setNotification({ type: 'error', message: 'الرجاء ملء بيانات التقرير والعنوان قبل الحفظ.' });
         setIsSaving(false);
         setTimeout(() => setNotification({ type: '', message: '' }), 3000);
         return;
    }
    
    try {
      const payload = {
        report_id: reportId, 
        student_id: selectedStudentId,
        report_identifier: reportIdentifier, // Pass the identifier instead of the date
        title: reportTitle.trim(),
        data_json: reportData,
      };
      
      const res = await api.post('/teacher/reports', payload);
      
      // Update state with newly created/updated report ID and identifier
      setReportId(res.data.id); 
      setReportIdentifier(res.data.report_identifier);

      setIsDirty(false);
      setNotification({ type: 'success', message: 'تم الحفظ بنجاح!' });
    } catch (err) {
      console.error("Save failed", err);
      // Display backend error message (e.g. unique identifier conflict)
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ.'); 
      setNotification({ type: 'error', message: err.response?.data?.message || 'حدث خطأ أثناء الحفظ.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
          setNotification({ type: '', message: '' });
          setFormError('');
      }, 3000);
    }
  };

  // ... (Handlers for table changes - unchanged) ...
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
      rowName: newRowName.trim(),
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
  
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- 1. Header and Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {stage === 'CREATE_EDIT_REPORT' ? (reportId ? 'تعديل التقرير' : 'إنشاء تقرير جديد') : 'إنشاء وإدارة التقارير'}
        </h1>
        
        {stage === 'CREATE_EDIT_REPORT' && (
             <div className="flex items-center gap-3">
               {/* Display current report identifier */}
               <span className="text-sm font-light text-spot-light">
                 تقرير لـ: <span className="font-medium text-spot-cyan">{reportIdentifier}</span>
               </span>
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
        )}
        
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
            disabled={loadingStudents || isSaving}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spot-light/50" />
        </div>
        <select 
          value={selectedStudentId}
          onChange={handleStudentSelectChange}
          className="input-style w-full"
          disabled={loadingStudents || isSaving}
        >
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
      
      
      {/* --- 3. Content Area based on Stage --- */}
      
      {/* Stage: PROMPT_IDENTIFIER (Modal to enter identifier) */}
       {stage === 'PROMPT_IDENTIFIER' && selectedStudentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-10 bg-spot-darker rounded-lg border border-spot-blue/30"
          >
             <h2 className="text-2xl text-white mb-6">اسم الأسبوع/التقرير الجديد لـ <span className="text-spot-cyan">{selectedStudent?.name}</span></h2>
             <form onSubmit={handleIdentifierSubmit} className="space-y-4 max-w-sm mx-auto">
                 <input 
                     type="text"
                     placeholder="مثال: الأسبوع 1، مراجعة الوحدة الأولى"
                     value={newIdentifierInput}
                     onChange={(e) => setNewIdentifierInput(e.target.value)}
                     className="input-style w-full"
                     autoFocus
                 />
                 {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                 <div className="flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => setStage('CHOOSE_ACTION')}
                        className="py-3 px-8 rounded-lg text-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all border border-spot-blue/50"
                     >
                         إلغاء
                     </button>
                     <button
                         type="submit"
                         className="py-3 px-8 rounded-lg text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all shadow-cyan-glow"
                     >
                         بدء التقرير
                     </button>
                 </div>
             </form>
          </motion.div>
       )}

      {/* Stage: CHOOSE_ACTION */}
      {stage === 'CHOOSE_ACTION' && selectedStudentId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-10 bg-spot-darker rounded-lg border border-spot-blue/30"
        >
          <h2 className="text-2xl text-white mb-6">ماذا تريد أن تفعله بتقارير <span className="text-spot-cyan">{selectedStudent?.name}</span>؟</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleCreateNewReportPrompt}
              className="flex items-center justify-center gap-2 py-3 px-8 rounded-lg text-lg font-medium text-black bg-spot-cyan hover:bg-spot-cyan-dark transition-all shadow-cyan-glow"
            >
              <FaPlus /> إنشاء تقرير جديد
            </button>
            <button
              onClick={handleManageReports}
              className="flex items-center justify-center gap-2 py-3 px-8 rounded-lg text-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all border border-spot-blue/50"
            >
              <FaFileAlt /> إدارة وتعديل التقارير السابقة
            </button>
          </div>
        </motion.div>
      )}

      {/* Stage: SELECT_STUDENT (Default/Initial empty state) */}
      {stage === 'SELECT_STUDENT' && (
         <div className="text-center p-10 bg-spot-darker rounded-lg border border-spot-blue/30 text-spot-light">
          الرجاء اختيار طالب من القائمة أعلاه للمتابعة.
        </div>
      )}
      
      {/* Stage: CREATE_EDIT_REPORT (The full table) */}
      {stage === 'CREATE_EDIT_REPORT' && selectedStudentId && (
          <>
          {/* Report Status Info */}
          <div className="bg-spot-dark/50 p-3 rounded-lg text-sm mb-4">
               {reportId ? (
                   <p className="text-green-400 flex items-center gap-2">
                       <FaCheck /> يتم تحرير التقرير المحفوظ لـ: <span className="font-medium text-spot-cyan">{reportIdentifier}</span>
                   </p>
               ) : (
                   <p className="text-yellow-400 flex items-center gap-2">
                       <FaTimes /> يتم إنشاء تقرير جديد لـ: <span className="font-medium text-spot-cyan">{reportIdentifier}</span>. يجب الحفظ لإنشائه.
                   </p>
               )}
          </div>
          {formError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center mb-4">{formError}</p>}
          
          {loadingReport ? (
            <div className="text-center p-10"><FaSpinner className="animate-spin text-spot-cyan text-4xl mx-auto" /></div>
          ) : (
            <div className="bg-spot-darker rounded-lg shadow-xl border border-spot-blue/30 overflow-x-auto">
              {/* ... (Table Content) ... */}
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
          </>
      )}

      {/* ... (Modal إضافة صف - Unchanged) ... */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddRow} className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">إضافة صف جديد</h3>
            <label className="block text-sm font-medium text-spot-light mb-2">اسم الصف</label>
            <input 
              type="text"
              name="newRowName"
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