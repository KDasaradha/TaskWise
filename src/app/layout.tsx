import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/SiteSidebar';
import AppHeader from '@/components/AppHeader';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskWise - Smart Task Management',
  description: 'Efficiently manage your tasks with an intelligent and modern application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          geistSans.variable, 
          geistMono.variable, 
          "font-sans antialiased bg-background text-foreground"
        )}
      >
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <SiteSidebar />
            <div 
              className={cn(
                "flex flex-col flex-grow transition-all duration-300 ease-in-out",
                "md:peer-data-[state=expanded]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width)]",
                "md:peer-data-[state=collapsed]:peer-data-[variant=sidebar]:ml-[var(--sidebar-width-icon)]"
              )}
            >
              <AppHeader />
              <main className="flex-grow p-4 sm:p-5 md:p-6 lg:p-8 overflow-y-auto"> 
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
