"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  ThemeToggler,
  type ThemeSelection,
  type Resolved,
  type Direction,
} from "@/components/animate-ui/primitives/effects/theme-toggler";

interface ThemeTogglerDemoProps {
  direction: Direction;
}

export const ThemeTogglerDemo = ({ direction }: ThemeTogglerDemoProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ThemeToggler
      theme={theme as ThemeSelection}
      resolvedTheme={resolvedTheme as Resolved}
      setTheme={setTheme}
      direction={direction}
    >
      {({ effective, toggleTheme }) => {
        const nextTheme = effective === "dark" ? "light" : "dark";

        return (
          <button
            onClick={() => toggleTheme(nextTheme)}
            className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-black  transition text-gray-900 dark:text-white"
            aria-label="Toggle theme"
            title={`Tema actual: ${effective}`}
          >
            {effective === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        );
      }}
    </ThemeToggler>
  );
};
