import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={`page-wrapper ${className}`}
    >
      {children}
    </motion.div>
  )
}
