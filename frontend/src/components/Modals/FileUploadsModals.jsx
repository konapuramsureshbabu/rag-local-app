import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../FileUpload';

const FileUploadModal = ({ isFileUploadOpen }) => {
  console.log('handleUpload22');

  return (
    <AnimatePresence>
      {isFileUploadOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          
          <div className="bg-white shadow-lg rounded-md border w-[90%] max-w-md p-4">
            <FileUpload compact={false} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileUploadModal;