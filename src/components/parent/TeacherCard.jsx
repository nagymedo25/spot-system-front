import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlaceholderImg from '../../assets/images/image4.jpeg';

const cardVariants = {
  initial: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    backgroundColor: '#0c121e',
    borderColor: '#1f4068',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
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
  initial: {
    opacity: 1,
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
    width: 180,
    height: 180,
    borderWidth: '4px',
    borderColor: '#101827',
    transform: 'translateY(0px)',
    boxShadow: '0 0 0px rgba(0, 240, 255, 0)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    width: 120,
    height: 120,
    borderWidth: '6px',
    borderColor: '#00f0ff',
    transform: 'translateY(-160px)', // تم التعديل ليناسب التصميم في index.css
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

// --- (الإضافة) متغيرات صورة الغلاف ---
const coverImageVariants = {
  initial: {
    opacity: 0,
    scale: 1.1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  hover: {
    opacity: 0.3, // (كما هو معرف في index.css)
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  }
};


const infoVariants = {
  initial: {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    opacity: 1,
    transform: 'translateY(-30px)', // تم التعديل ليناسب التصميم في index.css
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
        className="teacher-avatar rounded-full object-cover relative z-10" // <-- استخدام الكلاس الأصلي
      />
      
      {/* --- (الإصلاح) إرجاع صورة الغلاف المفقودة --- */}
      <motion.img
        src={imageUrl}
        alt="صورة غلاف المعلم"
        variants={coverImageVariants}
        className="info-cover-image" // <-- الكلاس من index.css
      />
      
      <motion.div
        variants={infoVariants}
        className="info-content absolute w-full text-center z-20" // <-- استخدام الكلاس الأصلي
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