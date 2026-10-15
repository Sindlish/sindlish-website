import ActionLink from 'components/shared/action-link';
import Container from 'components/shared/container';
import LINKS from 'constants/links';

import CodeSample from './code-sample';
import Hero from './hero';

// Straight from content/docs/basics/conditions.md: a real program with a real
// answer. Nothing here is written for the homepage.
const CONDITIONS_PROGRAM = `adad score = 72
agar score >= 80 {
  likh("A")
} yawari score >= 60 {
  likh("B")
} warna {
  likh("C")
}`;

const Home = () => (
  <>
    <Hero />
    <section className="border-b border-border bg-surface-page">
      <Container className="py-20 lg:py-14" size="1088">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary lg:text-2xl">
          Read a program in Sindlish
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          The interpreter runs a program from top to bottom and takes the first branch that is
          true. A score of 72 falls into the second branch, so this one prints B.
        </p>
        <div className="mt-8 max-w-2xl">
          <CodeSample filename="conditions.sd" code={CONDITIONS_PROGRAM} output="B" />
        </div>
        <p className="mt-6 max-w-2xl text-text-secondary">
          Read the full page on <ActionLink href="/docs/basics/conditions" variant="link">conditions</ActionLink>
          , or <ActionLink href={LINKS.download} variant="link">download Sindlish</ActionLink> to run
          it on your machine.
        </p>
      </Container>
    </section>
  </>
);

export default Home;
