import { motion } from 'framer-motion';
import { GitCommitHorizontal, GitPullRequest, Flame, Activity, Star } from 'lucide-react';
import githubData from '../data/github.json';

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 };
const nf = new Intl.NumberFormat('pt-BR');

function GhIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

const { contributions, repos } = githubData;

const stats = contributions
  ? [
      { icon: Flame, value: contributions.totalContributions, label: 'contribuições no último ano' },
      { icon: GitCommitHorizontal, value: contributions.totalCommits, label: 'commits' },
      { icon: GitPullRequest, value: contributions.totalPRs, label: 'pull requests' },
      { icon: Activity, value: contributions.activeDays, label: 'dias com código' },
    ]
  : [];

// Repos publicos com descricao, ordenados por stars e recencia
const featuredRepos = [...repos]
  .filter((r) => r.description && r.name !== 'leonardocandiani')
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 4);

function heatColor(count: number) {
  if (count <= 0) return 'rgba(255,255,255,0.04)';
  if (count <= 3) return 'rgba(245,158,11,0.25)';
  if (count <= 9) return 'rgba(245,158,11,0.45)';
  if (count <= 24) return 'rgba(245,158,11,0.7)';
  return 'rgba(251,191,36,0.95)';
}

export default function GitHubStats() {
  const weeks = contributions?.weeks ?? [];

  return (
    <section id="github" className="py-28 lg:py-36 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
        >
          <span className="eyebrow text-accent/70">// github · @leonardocandiani</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mt-4 tracking-tight">
            Mão na massa. <span className="text-gradient-amber">Todo dia.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mt-4">
            Itero em produção, com cliente real, sem ambiente de homologação
            enrolado. Os números abaixo são do último ano de trabalho.
          </p>
        </motion.div>

        {/* Numeros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <Icon className="w-5 h-5 text-accent/70 mb-4" />
                <div className="text-4xl md:text-5xl font-serif font-bold text-gradient-amber leading-none">
                  {nf.format(stat.value)}
                </div>
                <div className="text-white/45 text-sm mt-2">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Heatmap */}
        {weeks.length > 0 && (
          <motion.div
            className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 mb-12 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={spring}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-white/50 tracking-wide">
                últimos 12 meses
              </span>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <span>menos</span>
                {[0, 2, 6, 15, 30].map((c) => (
                  <span
                    key={c}
                    className="w-2.5 h-2.5 rounded-[2px]"
                    style={{ background: heatColor(c) }}
                  />
                ))}
                <span>mais</span>
              </div>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-[3px] min-w-max">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((count, di) => (
                      <div
                        key={di}
                        className="heat-cell w-2.5 h-2.5"
                        style={{ background: heatColor(count) }}
                        title={`${count} contribuições`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Open source */}
        {featuredRepos.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <GhIcon className="w-4 h-4 text-accent/70" />
              <span className="font-mono text-xs text-white/50 tracking-wide uppercase">
                open source público
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {featuredRepos.map((repo, i) => (
                <motion.a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 hover:border-accent/25 transition-colors duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ ...spring, delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-mono text-sm text-white/90 group-hover:text-accent transition-colors">
                      {repo.name}
                    </h3>
                    <span className="flex items-center gap-1 text-white/40 text-xs">
                      {repo.language && <span>{repo.language}</span>}
                      {repo.stars > 0 && (
                        <>
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                    {repo.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
