import Section from "@/components/site/section";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const TeamGrid = ({ title, members, columns, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    {title ? (
      <h2 className="pp-heading mb-12 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
        {title}
      </h2>
    ) : null}
    <div
      className={cn("grid grid-cols-1 gap-10 sm:grid-cols-2", {
        "lg:grid-cols-2": columns === 2,
        "lg:grid-cols-3": columns === 3,
        "lg:grid-cols-4": columns === 4,
      })}
    >
      {members.map((member, i) => (
        <div key={i} className="text-center">
          {member.photo?.url ? (
            <SiteImage
              media={member.photo}
              sizes="(max-width: 640px) 100vw, 300px"
              className="mx-auto mb-4 aspect-square w-full max-w-60 rounded-[var(--pp-radius-lg)] object-cover"
            />
          ) : null}
          <h3 className="pp-heading font-semibold">{member.name}</h3>
          {member.role ? (
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--pp-c-primary)" }}>
              {member.role}
            </p>
          ) : null}
          {member.bio ? <p className="pp-muted mt-2 text-sm leading-relaxed">{member.bio}</p> : null}
        </div>
      ))}
    </div>
  </Section>
);

export default TeamGrid;
