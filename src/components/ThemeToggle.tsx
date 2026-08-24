import { Sun, Moon } from "lucide-react";
import { Theme } from "../types";

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export default function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className="p-2 text-primary hover:bg-black/5 dark:hover:bg-white/10 dark:text-primary-fixed-dim transition-colors rounded-full active:rotate-12 active:scale-95 duration-150 border-2 border-transparent focus:outline-none flex items-center justify-center cursor-pointer"
      title={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      {theme === "light" ? (
        <Moon className="w-6 h-6 text-primary" />
      ) : (
        <Sun className="w-6 h-6 text-yellow-300" />
      )}
    </button>
  );
}
