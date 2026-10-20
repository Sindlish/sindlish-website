import parse from 'html-react-parser';
import PropTypes from 'prop-types';

import { parseFence } from 'lib/fences';
import highlight from 'lib/shiki';
import { cn } from 'utils/cn';

import CodeBlockWrapper from '../code-block-wrapper';

/**
 * Renders one fenced code block.
 *
 * The fence info string decides everything (see src/lib/fences.js):
 * `sd` gets a Run control, `sd illustrative` never does, `txt filename="Output"`
 * is an always-visible expected-output region, `bash` is shell. Highlighting
 * runs through lib/shiki, which colours Sindlish from the single generated
 * grammar artifact (src/lib/grammars/sindlish.tmLanguage.json).
 */
const CodeBlock = async ({
  className = null,
  copyButtonClassName = null,
  children,
  ...otherProps
}) => {
  const rawLanguage = children?.props?.className?.replace('language-', '') || 'text';
  const meta = children?.props?.meta || '';
  const fence = parseFence(rawLanguage, meta);
  const code = (
    typeof children?.props?.children === 'string' ? children.props.children : ''
  ).trim();
  const html = await highlight(code, fence.language, meta);

  return (
    <CodeBlockWrapper
      fence={fence}
      code={code}
      className={cn(className)}
      copyButtonClassName={copyButtonClassName}
      {...otherProps}
    >
      {parse(html)}
    </CodeBlockWrapper>
  );
};

CodeBlock.propTypes = {
  className: PropTypes.string,
  copyButtonClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default CodeBlock;
