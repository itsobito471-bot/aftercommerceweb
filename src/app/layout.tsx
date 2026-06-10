import React from 'react';
import '../styles.css';

export const metadata = {
  title: 'After Commerce',
  description: 'Enterprise Admin Dashboard for the After Commerce ecosystem. Manage courses, categories, affiliates, and more.',
  keywords: ['After Commerce', 'Admin Dashboard', 'LMS', 'E-commerce'],
  authors: [{ name: 'After Commerce Team' }],
  icons: {
    icon: '/icon.svg',
  },
};

/**
 * Root Next.js Layout
 * Houses global stylesheet import, metadata, and handles standard HTML rendering
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="h-full bg-slate-950 text-slate-100">
      <body className="h-full overflow-x-hidden antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
