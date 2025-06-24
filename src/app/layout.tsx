import { MobileHeader } from '@/components/mobile-header';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'TutorAI',
  description: 'Your personal AI tutor for Math, Programming, and Web Development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-body antialiased">
        <div>
          <Sidebar />
          <MobileHeader />
          <main className="lg:pl-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
            <div className="py-10">
              {children}
              <Analytics />
            </div>
          </main>
          <MobileSidebar />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
