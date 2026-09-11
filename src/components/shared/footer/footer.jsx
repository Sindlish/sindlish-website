import PropTypes from 'prop-types';

import Container from 'components/shared/container';
import Link from 'components/shared/link';
import Logo from 'components/shared/logo';
import LINKS from 'constants/links';
import MENUS from 'constants/menus.js';
import ChevronIcon from 'icons/chevron-down.inline.svg';
import { cn } from 'utils/cn';

const Footer = ({ hasThemesSupport: _hasThemesSupport = false }) => (
  <footer className="relative z-30 mt-auto border-t border-gray-new-90 bg-white safe-paddings dark:border-gray-new-20 dark:bg-black-pure">
    <Container className="flex justify-between gap-x-10 py-12 3xl:py-8 sm:py-5" size="1920">
      <div className="flex flex-col items-start lg:w-full">
        <div className="mb-auto lg:mb-11">
          <Logo className="sm:h-6 sm:w-auto" width={32} height={32} />
          <span
            className={cn(
              'mt-3.5 block text-[13px] leading-none font-medium tracking-extra-tight whitespace-nowrap',
              'text-[#E02424] dark:text-[#E02424]',
              'xl:mt-3'
            )}
          >
            Sindlish — Code in Sindhi
          </span>
        </div>

        <div className="flex flex-col items-start justify-between gap-y-5 lg:w-full lg:flex-row sm:flex-col">
          <div
            className={cn(
              'flex max-w-2xl flex-col gap-y-2 text-[13px] leading-none tracking-extra-tight text-gray-new-40',
              'dark:text-gray-new-60'
            )}
          >
            <p>© Sindlish {new Date().getFullYear()}. The first Sindhi programming language.</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              <Link
                className="hover:text-gray-new-20 dark:hover:text-gray-new-80"
                to={LINKS.github}
              >
                Open Source on GitHub
              </Link>
              <Link
                className="hover:text-gray-new-20 dark:hover:text-gray-new-80"
                to={LINKS.privacy}
              >
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-fit gap-x-[88px] xl:gap-x-6 lg:hidden">
        {MENUS.footer.map(({ heading, items }, index) => (
          <div className="grid content-start gap-y-7" key={index}>
            <span className="text-[10px] leading-none text-gray-new-10 uppercase dark:text-white">
              {heading}
            </span>
            <ul className="flex flex-col gap-y-5">
              {items.map(({ to, text, description, icon, links }, index) => {
                const Tag = to ? Link : 'div';
                const isExternalUrl = to?.startsWith('http');
                const hasSubmenu = links?.length > 0;

                return (
                  <li
                    key={index}
                    className={cn(
                      '-my-px flex min-w-[148px] py-px',
                      hasSubmenu && 'group relative [perspective:2000px]'
                    )}
                  >
                    <Tag
                      className={cn(
                        'group/link relative -my-px flex cursor-pointer items-center rounded-none py-px whitespace-nowrap',
                        'transition-colors duration-200 hover:text-black-pure',
                        'dark:text-gray-new-60 dark:hover:text-white'
                      )}
                      to={to}
                      rel={isExternalUrl ? 'noopener noreferrer' : null}
                      target={isExternalUrl ? '_blank' : null}
                    >
                      {icon && (
                        <span
                          className={cn(
                            icon,
                            'mr-2.5 inline-block size-4 bg-gray-new-30 dark:bg-gray-new-70',
                            'group-hover/link:bg-black-pure group-hover/link:dark:bg-white'
                          )}
                        />
                      )}
                      {text}
                      {description && (
                        <span
                          className={cn(
                            'ml-1.5 py-px text-gray-new-70 dark:text-gray-new-40',
                            to &&
                              'transition-colors duration-200 group-hover/link:text-gray-new-10 group-hover/link:dark:text-gray-new-90'
                          )}
                        >
                          {description}
                        </span>
                      )}
                      {hasSubmenu && <ChevronIcon className="ml-0.5 opacity-80" />}
                    </Tag>
                    {hasSubmenu && (
                      <div
                        className={cn(
                          'absolute right-0 bottom-full z-50 min-w-[230px] pb-2.5',
                          'pointer-events-none opacity-0',
                          'origin-bottom-right [transform:rotateX(12deg)_scale(0.9)] transition-[opacity,transform] duration-200',
                          'group-hover:pointer-events-auto group-hover:visible group-hover:[transform:none] group-hover:opacity-100',
                          'group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:[transform:none] group-focus-within:opacity-100'
                        )}
                      >
                        <ul
                          className={cn(
                            'flex w-full flex-col gap-y-1 border border-gray-new-80 bg-gray-new-98 p-2',
                            'dark:border-gray-new-20 dark:bg-[#0A0A0B]',
                            'shadow-[0px_10px_20px_0px_rgba(0,0,0,.06)] dark:shadow-[0px_8px_20px_0px_rgba(0,0,0,.4)]'
                          )}
                        >
                          {links.map(({ text, to }) => (
                            <li key={text}>
                              <Link
                                className="block p-3 text-[15px] leading-dense tracking-extra-tight whitespace-nowrap text-gray-new-10 transition-colors duration-200 hover:bg-gray-new-90 dark:text-gray-new-90 dark:hover:bg-gray-new-8"
                                to={to}
                              >
                                {text}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  </footer>
);

Footer.propTypes = {
  hasThemesSupport: PropTypes.bool,
};

export default Footer;
