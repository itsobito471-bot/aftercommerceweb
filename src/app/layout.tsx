import React from 'react';
import '../styles.css';

export const metadata = {
  title: 'LMS Enterprise Admin Dashboard',
  description: 'Decoupled Next.js Admin Panel for Learning Management System',
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
