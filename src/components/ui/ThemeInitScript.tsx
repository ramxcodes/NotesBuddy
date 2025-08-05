export function ThemeInitScript() {
  const script = `
    (function() {
      try {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' ) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
