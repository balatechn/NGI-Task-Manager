import { Head, Main, NextScript } from 'next/document';

// Use plain <html> element instead of Next.js <Html> component to avoid
// HtmlContext check failures during static generation of _error pages.
export default function Document() {
  return (
    <html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </html>
  );
}
