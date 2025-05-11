import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/SiteSidebar';
import AppHeader from '@/components/AppHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskWise',
  description: 'Smart Task Management Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground dark:bg-gray-900 dark:text-gray-100`}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen">
            <SiteSidebar />
            <div className="flex flex-col flex-grow md:peer-data-[state=expanded]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width)] peer-data-[state=collapsed]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width-icon)] transition-[margin-left] duration-300 ease-in-out">
              <AppHeader />
              <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
