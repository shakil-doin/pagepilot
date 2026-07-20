import Section from "@/components/site/section";
import type { Props } from "./schema";

const Check = () => (
  <>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--pp-c-primary)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
    <span className="sr-only">Yes</span>
  </>
);

const Cross = () => (
  <>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="pp-muted inline-block opacity-60"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
    <span className="sr-only">No</span>
  </>
);

const Comparison = ({ title, columnA, columnB, rows, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    {title ? (
      <h2 className="pp-heading mb-12 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
        {title}
      </h2>
    ) : null}
    <div className="mx-auto max-w-3xl overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--pp-c-border)" }}>
            <th scope="col" className="py-3 pr-4">
              <span className="sr-only">Feature</span>
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold" style={{ color: "var(--pp-c-primary)" }}>
              {columnA}
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold">
              {columnB}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b" style={{ borderColor: "var(--pp-c-border)" }}>
              <th scope="row" className="py-3 pr-4 font-medium">
                {row.feature}
              </th>
              <td className="px-4 py-3 text-center">{row.a ? <Check /> : <Cross />}</td>
              <td className="px-4 py-3 text-center">{row.b ? <Check /> : <Cross />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

export default Comparison;
