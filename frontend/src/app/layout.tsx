import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NGI Task Manager',
  description: 'NGI IT Infrastructure & CCTV Project Task Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
