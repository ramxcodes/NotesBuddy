import Script from "next/script";

type ThemeInitScriptProps = {
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};

export function ThemeInitScript({
  defaultTheme = "system",
  storageKey = "notes-buddy-theme",
}: ThemeInitScriptProps) {
  const script = `
    (function() {
      try {
        var storageKey = ${JSON.stringify(storageKey)};
        var defaultTheme = ${JSON.stringify(defaultTheme)};
        var storedTheme = localStorage.getItem(storageKey) || defaultTheme;
        var validTheme = storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system';

        if (!validTheme) {
          storedTheme = defaultTheme;
        }

        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var resolvedTheme = storedTheme === 'system'
          ? (prefersDark ? 'dark' : 'light')
          : storedTheme;

        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch (e) {}
    })();
  `;

  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
