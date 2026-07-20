import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => (
  <div
    className={cn("mx-auto w-full", className)}
    style={{
      maxWidth: "var(--pp-container-max)",
      paddingLeft: "var(--pp-container-gutter)",
      paddingRight: "var(--pp-container-gutter)",
    }}
  >
    {children}
  </div>
);

export default Container;
