import ActionLink from 'components/shared/action-link';
import Container from 'components/shared/container';
import Mascot from 'components/shared/mascot';
import LINKS from 'constants/links';
import MASCOT_LINES from 'constants/mascot-lines';

const GET_STARTED_HREF = '/docs/get-started/hello-world';

const Hero = () => (
  <section className="border-b border-border bg-surface-page">
    <Container
      className="flex flex-wrap items-center gap-x-16 gap-y-10 py-24 lg:py-16 md:py-12"
      size="1088"
    >
      <div className="min-w-[280px] flex-1">
        <h1 className="max-w-xl text-5xl leading-tight font-semibold tracking-tight text-text-primary xl:text-4xl lg:text-3xl">
          A programming language in Romanised Sindhi.
        </h1>
        <p className="mt-6 max-w-xl text-xl leading-snug text-text-secondary lg:text-lg">
          Write a program in the words you already speak. Read the docs, run an example, and watch
          the output appear in your browser.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <ActionLink href={GET_STARTED_HREF} variant="primary">
            Get started
          </ActionLink>
          <ActionLink href={LINKS.docs} variant="secondary">
            Docs
          </ActionLink>
        </div>
      </div>
      <Mascot variant="sit" size={300} line={MASCOT_LINES.hero} lineClassName="text-[17px]" />
    </Container>
  </section>
);

export default Hero;
