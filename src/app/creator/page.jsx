'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import ActionLink from 'components/shared/action-link';
import Container from 'components/shared/container';
import Layout from 'components/shared/layout';
import Mascot from 'components/shared/mascot';

const PROFILE_URL = 'https://api.github.com/users/AmanatAliPanhwer';

const CreatorPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(PROFILE_URL)
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  const stats = [
    ['Repos', user?.public_repos],
    ['Followers', user?.followers],
    ['Following', user?.following],
  ];

  return (
    <Layout isHeaderSticky isHeaderStickyOverlay>
      <section className="border-b border-border bg-surface-page">
        <Container
          className="flex flex-wrap items-center gap-x-16 gap-y-10 py-24 lg:py-16 md:py-12"
          size="1088"
        >
          <div className="min-w-[280px] flex-1">
            <p className="font-mono text-xs tracking-widest text-text-muted uppercase">
              The creator
            </p>
            <h1 className="mt-3 text-5xl leading-tight font-semibold tracking-tight text-text-primary xl:text-4xl lg:text-3xl">
              Behind Sindlish
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-snug text-text-secondary lg:text-lg">
              Who builds Sindlish, read live from GitHub.
            </p>
          </div>
          <Mascot variant="standing-neutral" size={110} />
        </Container>
      </section>

      {user && (
        <section className="bg-surface-page">
          <Container className="flex flex-wrap items-start gap-12 py-16" size="1088">
            <div className="w-[360px] shrink-0 border border-border bg-surface-raised lg:w-full lg:max-w-md">
              <div className="flex items-center gap-5 border-b border-border p-6">
                <Image
                  src={user.avatar_url}
                  alt=""
                  width={64}
                  height={64}
                  className="shrink-0 border border-border"
                />
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {user.name || 'Amanat Ali Panhwer'}
                  </h2>
                  <span className="text-sm text-text-muted">{`@${user.login}`}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
                {stats.map(([label, value]) => (
                  <div className="px-4 py-5" key={label}>
                    <span className="block text-2xl font-semibold text-text-primary">{value}</span>
                    <span className="mt-1 block text-xs font-medium tracking-widest text-text-muted uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <dl className="flex flex-col gap-3 p-6 text-sm text-text-secondary">
                {user.location && (
                  <div className="flex gap-3">
                    <dt className="text-text-muted">Location</dt>
                    <dd>{user.location}</dd>
                  </div>
                )}
                {user.company && (
                  <div className="flex gap-3">
                    <dt className="text-text-muted">Company</dt>
                    <dd>{user.company}</dd>
                  </div>
                )}
                <div className="flex gap-3">
                  <dt className="text-text-muted">Joined</dt>
                  <dd>
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-border p-6">
                <ActionLink
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                  variant="primary"
                >
                  Follow on GitHub
                </ActionLink>
              </div>
            </div>

            <div className="min-w-[280px] flex-1">
              {user.bio && (
                <p className="text-lg leading-relaxed text-text-secondary">{user.bio}</p>
              )}

              <div className="mt-10 flex flex-col gap-8">
                <section>
                  <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">
                    The mission
                  </h3>
                  <p className="mt-3 text-text-secondary">
                    Sindlish began with a plain question: why should programming be closed to
                    English speakers? The language brings software development closer to the more
                    than 30 million native Sindhi speakers by letting them write code in their own
                    mother tongue, which removes the overhead of translating thought into a new
                    language.
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">
                    The architecture
                  </h3>
                  <p className="mt-3 text-text-secondary">
                    Under the hood, Sindlish runs on a stack-based bytecode virtual machine modelled
                    on CPython, with a native object model and protocol-based dispatch, a hybrid
                    typing system, and Rust-inspired error handling.
                  </p>
                </section>

                <section className="border border-border bg-surface-raised p-6">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="size-1.5 bg-ok" />
                    <h3 className="font-mono text-xs tracking-widest text-text-muted uppercase">
                      Currently working on
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">
                    Sindlish v0.2.0, adding class definitions, inheritance, and a standard module
                    system.
                  </p>
                </section>
              </div>
            </div>
          </Container>
        </section>
      )}
    </Layout>
  );
};

export default CreatorPage;
