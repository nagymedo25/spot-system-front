import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';

const DeleteModal = ({ isOpen, onClose, onConfirm, isLoading, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-spot-darker rounded-lg shadow-xl border border-red-500/30 w-full max-w-md"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-4 border border-red-500/50">
              <FaTrash className="text-red-400 text-3xl" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{title || 'تأكيد الحذف'}</h3>
            <p className="text-spot-light/80 mb-6">
              {message || 'هل أنت متأكد أنك تريد المتابعة؟ لا يمكن التراجع عن هذا الإجراء.'}
            </p>

            <div className="flex justify-center gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isLoading}
                className="py-2 px-6 rounded-lg font-medium text-spot-light bg-spot-dark/50 hover:bg-spot-dark transition-all"
              >
                إلغاء
              </button>
              <button 
                type="button" 
                onClick={onConfirm} 
                disabled={isLoading}
                className="py-2 px-6 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 min-w-[100px]"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  'نعم، احذف'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteModal;