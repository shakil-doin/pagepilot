import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

// icons is flattened member-major: member i's social j sits at socialOffsets[i] + j.
type ViewProps = Props & { icons?: (string | null)[]; socialOffsets?: number[] };

const AuthorsTeamView = ({ badge, title, description, rule, columns, members, tone, icons = [], socialOffsets = [] }: ViewProps) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align="center" rule={rule} dark={dark} />
      <div
        className={cn("mt-10 grid gap-6 md:mt-14", {
          "md:grid-cols-1": columns === 1,
          "md:grid-cols-2": columns === 2,
          "md:grid-cols-2 lg:grid-cols-3": columns === 3,
        })}
      >
        {members.map((member, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[var(--pp-radius-xl)] border"
            style={{
              background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-background)",
              borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
            }}
          >
            <div
              className="flex items-center gap-4 p-5 md:p-6"
              style={{ background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)" }}
            >
              {member.avatar?.url ? (
                <SiteImage media={member.avatar} sizes="64px" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : null}
              <div>
                <h3 className="pp-heading text-lg font-bold">{member.name}</h3>
                {member.role ? <p className="pp-muted text-sm">{member.role}</p> : null}
              </div>
            </div>

            <div className="p-5 md:p-6">
              {member.bio ? <p className="pp-muted text-sm leading-relaxed md:text-base">{member.bio}</p> : null}

              {member.expertise.length > 0 ? (
                <>
                  {member.expertiseTitle ? (
                    <h4 className="pp-heading mt-6 text-lg font-bold">{member.expertiseTitle}</h4>
                  ) : null}
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {member.expertise.map((skill, j) => (
                      <span
                        key={j}
                        className="rounded-[var(--pp-radius-md)] px-3 py-2 text-center text-sm font-medium text-white"
                        style={{ background: "var(--pp-c-primary)" }}
                      >
                        {skill.text}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}

              {member.socials.length > 0 ? (
                <div className="mt-6 flex justify-center gap-3">
                  {member.socials.map((social, j) => (
                    <a
                      key={j}
                      href={social.link.href}
                      target={social.link.newTab ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5"
                      style={{ background: "var(--pp-c-secondary)" }}
                    >
                      <Glyph svg={icons[(socialOffsets[i] ?? 0) + j]} size={16} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default AuthorsTeamView;
