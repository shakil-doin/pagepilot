import { redirect } from "next/navigation";
import { auth } from "@/modules/auth";
import { inter } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import StudioProviders from "@/providers/studio-providers";
import StudioSidebar from "@/components/studio/shell/studio-sidebar";
import StudioTopbar from "@/components/studio/shell/studio-topbar";
import CommandPalette from "@/components/studio/shell/command-palette";

// Every Studio screen sits behind this guard; API handlers re-check on top
// (defense in depth).
const StudioLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.status === "DISABLED") redirect("/login?callbackUrl=/studio");

  return (
    <StudioProviders>
      <div className={cn(inter.className, "flex h-screen bg-app text-body antialiased")}>
        <StudioSidebar role={user.role} userName={user.name ?? user.email ?? ""} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StudioTopbar />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
        <CommandPalette role={user.role} />
      </div>
    </StudioProviders>
  );
};

export default StudioLayout;
