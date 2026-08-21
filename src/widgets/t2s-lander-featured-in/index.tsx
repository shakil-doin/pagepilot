import Container from "@/components/site/container";
import Marquee from "@/components/site/t2s/marquee";
import Panel from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sLanderFeaturedIn = ({ title, outlets, speed, tone }: Props) => {
  if (outlets.length === 0) return null;

  return (
    <Panel tone={tone} padding="md" contained={false}>
      {title ? (
        <Container>
          <h2 className="pp-muted text-center text-base font-medium md:font-semibold">{title}</h2>
        </Container>
      ) : null}
      <div className="mt-8">
        <Marquee speed={speed} itemClassName="w-auto">
          {outlets.map((outlet, i) => (
            <span
              key={i}
              className={cn(
                "pp-muted whitespace-nowrap px-6 text-base font-bold tracking-tight md:px-10 md:text-[28px]",
                outlet.italic && "italic",
              )}
            >
              {outlet.name}
            </span>
          ))}
        </Marquee>
      </div>
    </Panel>
  );
};

export default T2sLanderFeaturedIn;
