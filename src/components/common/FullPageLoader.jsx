import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../assets/images/Logo.png'; // سنستخدم اللوجو الفعلي بدلاً من النص

// متغيرات الأنيميشن للحاوية
const loaderVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// متغيرات الأنيميشن للوجو (تأثير النبض والتوهج)
const logoVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    filter: [
      'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))',
      'drop-shadow(0 0 25px rgba(0, 240, 255, 1))',
      'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const FullPageLoader = () => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-spot-darker/90 backdrop-blur-sm"
        variants={loaderVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.img
          src={Logo}
          alt="Loading SPOT"
          className="w-40 h-auto"
          variants={logoVariants}
          animate="pulse"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default FullPageLoader;