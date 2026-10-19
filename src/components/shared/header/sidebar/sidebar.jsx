import PropTypes from 'prop-types';

import Button from 'components/shared/button';
import Link from 'components/shared/link';
import LINKS from 'constants/links';
import GitHubIcon from 'icons/github.inline.svg';
import { cn } from 'utils/cn';

const SOCIALS = [
  {
    id: 'github',
    to: LINKS.github,
    icon: GitHubIcon,
    label: 'GitHub',
  },
];

const Sidebar = ({ isDocs, className }) => (
  <div className={cn('flex items-center lg:hidden', isDocs ? 'gap-x-6' : 'gap-x-8', className)}>
    <div className={cn('flex items-center', isDocs ? 'gap-x-4' : 'gap-x-6')}>
      {SOCIALS.map(({ id, to, icon: Icon, label }) => (
        <Link
          className={cn(
            'group flex items-center gap-1.5 tracking-extra-tight transition-colors duration-200',
            isDocs && 'size-8 justify-center border border-gray-new-60 dark:border-gray-new-40',
            isDocs
              ? 'rounded-none text-gray-new-10 hover:border-black-new hover:text-black-new dark:text-gray-new-90 dark:hover:border-gray-new-40 dark:hover:text-white'
              : 'rounded-none text-black-pure hover:text-gray-new-30 dark:text-white dark:hover:text-gray-new-70'
          )}
          key={id}
          to={to}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon
            width={18}
            height={18}
            className={cn(
              !isDocs &&
                'text-gray-new-20 transition-colors group-hover:text-gray-new-30 dark:text-gray-new-90 dark:group-hover:text-gray-new-80'
            )}
          />
          {!isDocs && <span className="text-sm leading-none tracking-extra-tight">{label}</span>}
        </Link>
      ))}
    </div>
    <div className={cn('flex', isDocs ? 'gap-x-2' : 'gap-x-3.5')}>
      <Button className="h-9 px-[18px]" to={LINKS.download} theme="white-filled-multi" size="xxs">
        Download
      </Button>
    </div>
  </div>
);

Sidebar.propTypes = {
  isDocs: PropTypes.bool,
  className: PropTypes.string,
};

export default Sidebar;
