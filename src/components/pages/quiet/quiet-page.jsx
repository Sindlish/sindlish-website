import PropTypes from 'prop-types';

import ActionLink from 'components/shared/action-link';
import Container from 'components/shared/container';
import Mascot from 'components/shared/mascot';

const QuietPage = ({
  title,
  message,
  hint = null,
  mascot,
  links = [],
  children = null,
}) => (
  <section className="bg-surface-page">
    <Container className="py-24 lg:py-16" size="1088">
      <div className="flex flex-wrap items-center gap-12">
        <div className="min-w-[280px] flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary lg:text-2xl">
            {title}
          </h1>
          <p className="mt-3 text-lg text-text-secondary">{message}</p>
          {hint && <p className="mt-2 text-sm text-text-muted">{hint}</p>}
          {(children || links.length > 0) && (
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {children}
              {links.map(({ text, href }) => (
                <ActionLink
                  key={`${href}-${text}`}
                  href={href}
                  variant="link"
                >
                  {text}
                </ActionLink>
              ))}
            </div>
          )}
        </div>
        <Mascot
          variant={mascot.variant}
          size={mascot.size}
          alt={mascot.alt}
          line={mascot.line}
        />
      </div>
    </Container>
  </section>
);

QuietPage.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  hint: PropTypes.string,
  mascot: PropTypes.shape({
    variant: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    alt: PropTypes.string,
    line: PropTypes.shape({
      sd: PropTypes.string.isRequired,
      gloss: PropTypes.string,
    }),
  }).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ),
  children: PropTypes.node,
};

export default QuietPage;
