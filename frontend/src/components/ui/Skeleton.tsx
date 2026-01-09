import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  className = '',
  variant = 'default',
  width,
  height,
}: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-lol-card via-lol-hover to-lol-card bg-[length:200%_100%]';

  const variantClasses = {
    default: 'rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
