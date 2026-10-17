import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import PropTypes from 'prop-types';
import remarkGfm from 'remark-gfm';

import DocsLink from 'components/pages/doc/docs-link';
import Steps from 'components/pages/doc/steps';
import Admonition from 'components/shared/admonition';
import AnchorHeading from 'components/shared/anchor-heading';
import CodeBlock from 'components/shared/code-block';
import ImageZoom from 'components/shared/image-zoom';
import Mermaid from 'components/shared/mermaid';
import getCodeProps from 'lib/rehype-code-props';
import { cn } from 'utils/cn';

/**
 * The complete MDX component surface for docs pages (issue #50).
 *
 * Authors write exactly two components — `<Admonition>` and `<Steps>` —
 * plus the four code fences parsed in lib/fences.js. Everything else is
 * plain Markdown rendered through the mappings below. The admission rule
 * (what may join this map, and the process for removing entries) lives in
 * content/docs/README.md.
 */
const getComponents = () => ({
  h2: AnchorHeading('h2'),
  h3: AnchorHeading('h3'),
  h4: AnchorHeading('h4'),
  table: (props) => (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  ),
  undefined: (props) => <>{props.children}</>,
  pre: (props) => {
    const codeElement = props?.children;
    const code = codeElement?.props?.children;
    const className = codeElement?.props?.className || '';

    // Check if this is a mermaid code block
    if (
      codeElement &&
      typeof code === 'string' &&
      className &&
      className.includes('language-mermaid')
    ) {
      return <Mermaid chart={code.trim()} />;
    }

    return <CodeBlock {...props} />;
  },
  a: (props) => <DocsLink {...props} />,
  img: (props) => {
    const { className, title, src, ...rest } = props;

    // AVIF/WebP optimization can flatten PNG/GIF alpha to black; keep originals for local /docs/ rasters.
    const unoptimizedPreserveAlpha =
      typeof src === 'string' && /^\/docs\/.+\.(png|gif)$/i.test(src);

    return (
      <ImageZoom src={src}>
        <Image
          className={cn(className, { 'no-border': title === 'no-border' })}
          src={src}
          width={704}
          height={447}
          style={{ width: '100%', height: '100%' }}
          title={title !== 'no-border' ? title : undefined}
          unoptimized={unoptimizedPreserveAlpha}
          {...rest}
        />
      </ImageZoom>
    );
  },
  Admonition,
  Steps,
});

const Content = ({ className = null, content, asHTML = false }) => {
  const rootClassName = cn(
    'prose-doc post-content prose dark:prose-invert xs:prose-code:break-words',
    className
  );

  if (asHTML) {
    return <div className={rootClassName} dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className={rootClassName}>
      <MDXRemote
        components={getComponents()}
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [
              // Adds support for GitHub Flavored Markdown
              remarkGfm,
            ],
            rehypePlugins: [getCodeProps],
          },
          blockJS: false,
          blockDangerousJS: true,
        }}
      />
    </div>
  );
};
Content.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  asHTML: PropTypes.bool,
};

export default Content;
