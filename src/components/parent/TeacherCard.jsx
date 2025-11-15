import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlaceholderImg from '../../assets/images/image4.jpeg';

// تم حذف جميع الـ variants (cardVariants, ringVariants, avatarVariants, إلخ)
// لأن ملف index.css يعالجها بشكل أفضل عن طريق @media (hover: hover)

const TeacherCard = ({ teacher }) => {
  const imageUrl = teacher.avatar_url || PlaceholderImg;

  return (
    // تم حذف props الـ variants و whileHover
    <motion.div
      className="teacher-container relative flex justify-center items-center cursor-pointer border"
    >
      
      {/* تم حذف props الـ variants */}
      <motion.div
        className="absolute z-0 inset-[-4px] rounded-full [background:conic-gradient(from_0deg,#00f0ff,transparent_40%,transparent_80%,#00f0ff)] animate-spin"
        style={{ animationDuration: '3s' }}
      />
      
      {/* تم حذف props الـ variants */}
      <motion.img
        src={imageUrl}
        alt={teacher.name}
        className="teacher-avatar object-cover relative z-10" 
      />
      
      {/* تم حذف props الـ variants */}
      <motion.img
        src={imageUrl}
        alt="صورة غلاف المعلم"
        className="info-cover-image" 
      />
      
      {/* تم حذف props الـ variants */}
      <motion.div
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