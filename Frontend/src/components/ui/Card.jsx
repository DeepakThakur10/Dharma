import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={hover ? {
                y: -4,
                transition: { duration: 0.2 }
            } : undefined}
            className={cn(
                'rounded-xl border p-5 transition-shadow duration-200',
                hover && 'hover:shadow-card-hover cursor-pointer',
                'shadow-card',
                className
            )}
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
