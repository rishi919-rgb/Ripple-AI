import React from 'react';
import { motion } from 'framer-motion';

interface DiscoveryStageProps {
  children: React.ReactNode;
}

export const DiscoveryStage: React.FC<DiscoveryStageProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 w-full"
    >
      {children}
    </motion.div>
  );
};
export default DiscoveryStage;
