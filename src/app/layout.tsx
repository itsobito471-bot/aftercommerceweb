import React from 'react';
import '../styles.css';

export const metadata = {
  title: 'After Commerce - The Complete Learning Platform',
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
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full overflow-x-hidden antialiased selection:bg-[#2B4788] selection:text-white">
        {children}
      </body>
    </html>
  );
}
