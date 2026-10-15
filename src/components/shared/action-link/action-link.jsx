import NextLink from 'next/link';
import PropTypes from 'prop-types';

import { cn } from 'utils/cn';

import { ACTION_STYLES } from './styles';

/**
 * A single action that navigates. Internal paths go through `next/link` for
 * client-side navigation; everything else (external URLs, in-page anchors) is a
 * plain anchor.
 */
const ActionLink = ({ href, variant = 'primary', className = null, children, ...props }) => {
  const actionClassName = cn(ACTION_STYLES[variant], className);

  if (href.startsWith('/')) {
    return (
      <NextLink className={actionClassName} href={href} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <a className={actionClassName} href={href} {...props}>
      {children}
    </a>
  );
};

ActionLink.propTypes = {
  href: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.keys(ACTION_STYLES)),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default ActionLink;
