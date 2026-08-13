import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ConsistencyStatus } from '../types';

interface StatusChipProps {
  status: ConsistencyStatus;
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  score,
  showLabel = false,
  size = 'md',
  className = '',
  onClick,
}) => {
  const isConsistent = status === 'consistent';
  const isNeedsReview = status === 'needs_review';

  // Flat matte configuration based on Adobe Premiere Pro palette rules
  const config = isConsistent
    ? {
        bg: 'rgba(122, 158, 140, 0.15)',
        border: '#7A9E8C',
        text: '#7A9E8C',
        iconColor: '#7A9E8C',
        label: 'Consistent',
        Icon: CheckCircle2,
      }
    : isNeedsReview
    ? {
        bg: 'rgba(201, 162, 75, 0.15)',
        border: '#C9A24B',
        text: '#C9A24B',
        iconColor: '#C9A24B',
        label: 'Needs Review',
        Icon: Clock,
      }
    : {
        bg: 'rgba(201, 117, 107, 0.15)',
        border: '#C9756B',
        text: '#C9756B',
        iconColor: '#C9756B',
        label: 'Inconsistent',
        Icon: AlertCircle,
      };

  const IconComponent = config.Icon;

  // Size styling
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs gap-2'
      : 'px-2.5 py-1 text-[11px] gap-1.5';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <motion.div
      onClick={onClick}
      initial={false}
      animate={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded font-mono font-medium border select-none ${
        onClick ? 'cursor-pointer hover:bg-opacity-25 transition-all' : ''
      } ${sizeClasses} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${status}-${score}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 shrink-0"
        >
          <IconComponent className={`${iconSizes} shrink-0`} style={{ color: config.iconColor }} />
          <span>
            {score}%{showLabel ? ` • ${config.label}` : ''}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
