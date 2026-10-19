import Image from 'next/image';
import PropTypes from 'prop-types';

import { cn } from 'utils/cn';

import { MASCOT_ART_DIMENSIONS, MASCOT_VARIANTS, hasMascotArt, mascotArtPath } from './mascot-art';

/**
 * The art half of the mascot. Renders the PNG when it exists, otherwise a dashed
 * frame labelled with the expected filename. The placeholder is scaffolding for
 * whoever swaps the art in, so it is hidden from assistive technology.
 *
 * Pass a meaningful `alt` only when the mascot itself carries meaning (the
 * run-failure placement does). Everywhere else leave it empty.
 */
const MascotArt = ({ variant, size, alt = '', className = null }) => {
  if (!hasMascotArt(variant)) {
    return (
      <span
        aria-hidden="true"
        title={mascotArtPath(variant)}
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-border-strong p-1 text-center font-mono text-[11px] leading-tight text-text-muted',
          className
        )}
        style={{ height: size, width: Math.round(size * 1.15) }}
      >
        {`mascot-${variant}.png`}
      </span>
    );
  }

  const { width, height } = MASCOT_ART_DIMENSIONS[variant];
  const scaledWidth = Math.round((size * width) / height);

  return (
    <Image
      src={mascotArtPath(variant)}
      alt={alt}
      width={scaledWidth}
      height={size}
      className={cn('block h-auto w-auto shrink-0', className)}
    />
  );
};

MascotArt.propTypes = {
  variant: PropTypes.oneOf(MASCOT_VARIANTS).isRequired,
  size: PropTypes.number.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

/**
 * A mascot placement: an optional speech bubble followed by the art.
 *
 * The bubble uses the settled cut-mark decor: a red frame, a 6x6 red plate in
 * the lower-right corner and an even leader line pointing at the mascot. Red is
 * frame and mark only; the line itself stays token text.
 *
 * The mascot never animates here, so there is no reduced-motion branch to write.
 */
const Mascot = ({
  variant,
  size,
  alt = '',
  line = null,
  lineClassName = null,
  className = null,
}) => (
  <div className={cn('flex items-start gap-4', className)}>
    {line && (
      <p
        lang="sd-Latn"
        title={line.gloss}
        className={cn(
          'relative max-w-[26ch] border-2 border-brand bg-surface-overlay px-4 py-3 text-[15px] leading-snug text-text-primary',
          'before:absolute before:right-2 before:bottom-2 before:size-1.5 before:bg-brand',
          'after:absolute after:top-1/2 after:-right-2.5 after:h-0.5 after:w-2 after:-translate-y-1/2 after:bg-brand',
          lineClassName
        )}
      >
        {line.sd}
      </p>
    )}
    <MascotArt variant={variant} size={size} alt={alt} />
  </div>
);

Mascot.propTypes = {
  variant: PropTypes.oneOf(MASCOT_VARIANTS).isRequired,
  size: PropTypes.number.isRequired,
  alt: PropTypes.string,
  line: PropTypes.shape({ sd: PropTypes.string.isRequired, gloss: PropTypes.string }),
  lineClassName: PropTypes.string,
  className: PropTypes.string,
};

export { MascotArt };
export default Mascot;
