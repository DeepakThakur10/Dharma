import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

/**
 * @typedef {Object} ModalProps
 * @property {string} [name]
 * @property {string} title
 * @property {React.ReactNode} children
 * @property {string} [maxWidth]
 * @property {boolean} [isOpen]
 * @property {() => void} [onClose]
 */

/** @param {ModalProps} props */
export default function Modal({ name, title, children, maxWidth = 'max-w-lg', isOpen: isOpenProp, onClose: onCloseProp }) {
    const { activeModal, closeModal } = useUIStore();

    // Support both patterns
    const isOpen = name ? activeModal === name : !!isOpenProp;
    const handleClose = name ? closeModal : (onCloseProp || (() => { }));

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') handleClose(); };
        if (isOpen) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, handleClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`w-full ${maxWidth} rounded-xl border shadow-modal overflow-hidden flex flex-col max-h-[min(90vh,800px)]`}
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                            <h3 className="text-lg font-display font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center interactive"
                            >
                                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
