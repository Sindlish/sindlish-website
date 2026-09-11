import Link from 'next/link';
import PropTypes from 'prop-types';

import Chevron from 'icons/chevron-right-lg.inline.svg';
import { cn } from 'utils/cn';

const content = {
  'start-here': [
    {
      id: 1,
      href: '/docs/get-started/installation',
      label: 'Install Sindlish on your machine',
      type: 'Docs',
    },
    {
      id: 2,
      href: '/docs/introduction',
      label: 'Write your first Sindlish program',
      type: 'Docs',
    },
    {
      id: 3,
      href: '/docs/basics/variables',
      label: 'Learn variables and types',
      type: 'Docs',
    },
    {
      id: 4,
      href: '/docs/intermediate/functions',
      label: 'Understand functions and returns',
      type: 'Docs',
    },
    {
      id: 5,
      href: '/docs/reference/standard-library',
      label: 'Browse the standard library',
      type: 'Docs',
    },
  ],
};

const QuickLinks = ({ type = 'start-here', className, title }) => {
  const links = content[type] || [];

  return (
    <section className={cn('quick-links', className)}>
      <h2 className="pt-10 pb-6 text-[30px] leading-snug font-semibold tracking-tight">{title}</h2>
      <ul className="m-0! p-0!">
        {links.map(({ id, href, label, type }, index) => {
          const isFirst = index === 0;
          const isLast = index === links.length - 1;

          return (
            <li
              key={id}
              className={cn(
                'm-0! border-x border-b border-[#27272A] p-4! transition before:content-none! hover:bg-[#27272A80]',
                {
                  'border-t': isFirst,
                  'rounded-t-lg': isFirst,
                  'rounded-b-lg': isLast,
                }
              )}
            >
              <Link
                href={href}
                className="flex justify-between border-none text-gray-new-98!"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex max-w-[calc(100%-64px)] flex-col gap-2.5 md:max-w-[calc(100%-32px)]">
                  {type && (
                    <span className="text-sm leading-none tracking-tight text-green-45">
                      {type}
                    </span>
                  )}
                  <span className="truncate text-xl leading-snug font-medium tracking-tight">
                    {label}
                  </span>
                </div>
                <Chevron className="w-2 text-gray-new-50" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

QuickLinks.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default QuickLinks;
