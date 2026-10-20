import ActionLink from 'components/shared/action-link';
import Container from 'components/shared/container';
import Layout from 'components/shared/layout';
import Mascot from 'components/shared/mascot';
import LINKS from 'constants/links';
import MASCOT_LINES from 'constants/mascot-lines';
import SEO_DATA from 'constants/seo-data';
import buildMetadata from 'utils/get-metadata';

export const metadata = buildMetadata(SEO_DATA.download);

// Release URLs and file names are exact. Do not tidy the double slash: the
// artifact path GitHub serves is spelled that way.
const RELEASE_VERSION = 'v0.1.1';
const RELEASE_DOWNLOAD_BASE =
  'https://github.com/Sindlish/Sindlish/releases/latest/download//';
const RELEASES_URL = 'https://github.com/Sindlish/Sindlish/releases';

const PLATFORMS = [
  {
    name: 'Windows',
    arch: 'x86_64',
    file: 'sindlish-installer-win64.exe',
    instructions: [
      'Download the .exe installer',
      'Run the installer to set up paths',
      'Run sindlish --version',
    ],
  },
  {
    name: 'Linux',
    arch: 'x86_64',
    file: 'sindlish-installer-linux.deb',
    instructions: [
      'Download the .deb package',
      'Run: sudo dpkg -i sindlish-installer-linux.deb',
      'Run sindlish --version',
    ],
  },
  {
    name: 'macOS',
    arch: 'arm64 / x86_64',
    file: 'sindlish-installer-macos.pkg',
    instructions: [
      'Download the .pkg installer',
      'Open the package to run the installer',
      'Run sindlish --version',
    ],
  },
];

const DownloadPage = () => (
  <Layout isHeaderSticky isHeaderStickyOverlay>
    <section className="border-b border-border bg-surface-page">
      <Container
        className="flex flex-wrap items-center gap-x-16 gap-y-10 py-24 lg:py-16 md:py-12"
        size="1088"
      >
        <div className="min-w-[280px] flex-1">
          <p className="font-mono text-xs tracking-widest text-text-muted uppercase">Download</p>
          <h1 className="mt-3 text-5xl leading-tight font-semibold tracking-tight text-text-primary xl:text-4xl lg:text-3xl">
            Get Sindlish {RELEASE_VERSION}
          </h1>
          <p className="mt-5 max-w-xl text-xl leading-snug text-text-secondary lg:text-lg">
            Install the interpreter for your platform, then run your first program. The current
            release is {RELEASE_VERSION}.
          </p>
        </div>
        <Mascot variant="point" size={110} line={MASCOT_LINES.download} />
      </Container>
    </section>

    <section className="border-b border-border bg-surface-page">
      <Container className="py-12" size="1088">
        <div className="max-w-2xl border-l-2 border-brand bg-surface-raised px-5 py-4">
          <p className="font-mono text-xs tracking-widest text-text-muted uppercase">
            Release notice
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            This is the current {RELEASE_VERSION} release. The binaries are not yet verified by the
            platform vendors, so your system may report them as risky. All Sindlish source code is
            open and available to audit on GitHub. The Linux and macOS builds are still
            experimental, and your feedback helps us make them dependable.
          </p>
        </div>
      </Container>
    </section>

    <section className="border-b border-border bg-surface-page">
      <Container className="py-16" size="1088">
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          Choose your platform
        </h2>
        <div className="mt-8 grid grid-cols-3 gap-6 lg:grid-cols-1">
          {PLATFORMS.map(({ name, arch, file, instructions }) => (
            <article
              key={name}
              className="flex flex-col border border-border bg-surface-raised"
            >
              <header className="border-b border-border px-6 py-5">
                <h3 className="text-xl font-semibold text-text-primary">{name}</h3>
                <span className="mt-1 block font-mono text-xs tracking-widest text-text-muted uppercase">
                  {arch}
                </span>
              </header>
              <ol className="flex-1 space-y-3 px-6 py-5 text-sm text-text-secondary">
                {instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
              <div className="p-6 pt-0">
                <ActionLink
                  href={`${RELEASE_DOWNLOAD_BASE}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                  variant="primary"
                >
                  {`Download for ${name}`}
                </ActionLink>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <section className="bg-surface-page">
      <Container className="flex flex-wrap items-start gap-8 py-12" size="1088">
        <div className="min-w-[280px] flex-1">
          <h2 className="text-xl font-semibold text-text-primary">Need help?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Read the docs, or check the changelog for the full release notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ActionLink href={LINKS.docsHome} variant="secondary">
            Documentation
          </ActionLink>
          <ActionLink
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            GitHub Releases
          </ActionLink>
        </div>
      </Container>
    </section>
  </Layout>
);

export default DownloadPage;
