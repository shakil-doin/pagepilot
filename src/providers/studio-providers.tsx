"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type StudioTheme = "light" | "dark";
const ThemeContext = createContext<{ theme: StudioTheme; toggle: () => void }>({
  theme: "light",
  toggle: () => undefined,
});

export const useStudioTheme = () => useContext(ThemeContext);

const StudioProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1 } } }),
  );
  // Lazy init reads the persisted preference on the client; the server render
  // falls back to light and the effect below stamps the class after mount.
  const [theme, setTheme] = useState<StudioTheme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("pp-studio-theme") as StudioTheme | null;
    return stored ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pp-studio-theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster position="bottom-right" theme={theme} richColors />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

export default StudioProviders;
