import PropTypes from 'prop-types';

import { cn } from 'utils/cn';

import { ACTION_STYLES } from './styles';

/**
 * The button half of an action. Used where the action runs code instead of
 * navigating, such as the runtime-error "Try again" control.
 */
const ActionButton = ({ variant = 'primary', className = null, children, ...props }) => (
  <button type="button" className={cn(ACTION_STYLES[variant], className)} {...props}>
    {children}
  </button>
);

ActionButton.propTypes = {
  variant: PropTypes.oneOf(Object.keys(ACTION_STYLES)),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default ActionButton;
