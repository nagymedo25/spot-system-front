import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlaceholderImg from '../../assets/images/image4.jpeg';

// FIX: تعريف الحالة الأساسية (initial) كـ "كارت مفتوح/مستطيل"
const cardVariants = {
  initial: {
    width: 320,
    height: 400,
    borderRadius: '1.5rem', // كارت كامل
    backgroundColor: '#0c121e',
    borderColor: '#00f0ff',
    boxShadow: '0 0 50px rgba(0, 240, 255, 0.4)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    // حالة التحويم على الديسكتوب تبقى كارت كامل (لأنها تبدأ من حالة الانهيار)
    width: 320,
    height: 400,
    borderRadius: '1.5rem',
    backgroundColor: '#0c121e',
    borderColor: '#00f0ff',
    boxShadow: '0 0 50px rgba(0, 240, 255, 0.4)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const ringVariants = {
  // FIX: إخفاء حلقة التوهج تماماً بشكل افتراضي (للجوال)
  initial: {
    opacity: 0,
    scale: 1.5,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    opacity: 0,
    scale: 1.5,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const avatarVariants = {
  initial: {
    width: 120,
    height: 120,
    borderWidth: '6px',
    borderColor: '#00f0ff',
    borderRadius: '0.75rem', // <<< FIX: أفاتار مربع مستدير
    transform: 'translateY(-160px)',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    width: 120,
    height: 120,
    borderWidth: '6px',
    borderColor: '#00f0ff',
    borderRadius: '0.75rem', // أفاتار مربع مستدير
    transform: 'translateY(-160px)',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const coverImageVariants = {
  initial: {
    opacity: 0.3, // FIX: إظهار الغلاف في الوضع الافتراضي (الهاتف)
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  hover: {
    opacity: 0.3,
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  }
};


const infoVariants = {
  initial: {
    opacity: 1, // FIX: إظهار المحتوى في الوضع الافتراضي (الهاتف)
    transform: 'translateY(-30px)',
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 },
  },
  hover: {
    opacity: 1,
    transform: 'translateY(-30px)',
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 },
  },
};

const TeacherCard = ({ teacher }) => {
  const imageUrl = teacher.avatar_url || PlaceholderImg;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      className="teacher-container relative flex justify-center items-center cursor-pointer border"
    >
      
      <motion.div
        variants={ringVariants}
        className="absolute z-0 inset-[-4px] rounded-full [background:conic-gradient(from_0deg,#00f0ff,transparent_40%,transparent_80%,#00f0ff)] animate-spin"
        style={{ animationDuration: '3s' }}
      />
      
      <motion.img
        src={imageUrl}
        alt={teacher.name}
        variants={avatarVariants}
        className="teacher-avatar object-cover relative z-10" 
      />
      
      <motion.img
        src={imageUrl}
        alt="صورة غلاف المعلم"
        variants={coverImageVariants}
        className="info-cover-image" 
      />
      
      <motion.div
        variants={infoVariants}
        className="info-content absolute w-full text-center z-20" 
      >
        <h3 className="text-2xl font-bold text-white mb-1">{teacher.name}</h3>
        <p className="text-base text-spot-cyan mb-4">{teacher.specialty}</p>
        <Link
          to="/report-view"
          state={{ teacher }}
          className="details-button inline-block bg-spot-cyan text-black px-6 py-2 rounded-full font-semibold transition-all hover:bg-white hover:shadow-cyan-glow"
        >
          عرض التقارير
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default TeacherCard;