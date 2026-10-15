'use client';

import { MotionConfig } from 'framer-motion';
import PropTypes from 'prop-types';

/*
 * Mounts framer-motion's reduced-motion handling once, at the root.
 * `reducedMotion="user"` makes every motion component under it skip transform
 * and layout animations (keeping opacity) when the OS asks for reduced motion,
 * so an animation cannot forget to opt in. See docs/internal/motion.md.
 */
const MotionProvider = ({ children }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);

MotionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MotionProvider;
