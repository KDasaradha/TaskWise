"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton, // For loading states if needed
} from '@/components/ui/sidebar';
import { Zap, LayoutDashboard, BarChart3, Info, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home', icon: <Zap /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 /> },
  { href: '/about', label: 'About', icon: <Info /> },
];

const menuButtonVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: { 
    backgroundColor: "hsl(var(--sidebar-accent))",
    color: "hsl(var(--sidebar-accent-foreground))",
    scale: 1.03,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};


export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
          <motion.span 
            className="text-2xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden group-hover:text-accent transition-colors duration-300"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            TaskWise
          </motion.span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navLinks.map((link, index) => (
            <SidebarMenuItem key={link.href} asChild>
              <motion.div
                custom={index}
                variants={menuButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.1 * index, type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link href={link.href}>
                  <SidebarMenuButton
                    className={cn(
                      "w-full justify-start gap-3 rounded-lg text-base",
                      pathname === link.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    )}
                    tooltip={{
                      children: link.label,
                      className: "bg-popover text-popover-foreground shadow-md rounded-md"
                    }}
                  >
                    <span className="group-data-[collapsible=icon]:mx-auto">{link.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border flex items-center justify-between group-data-[collapsible=icon]:justify-center">
        <ThemeToggle />
        <motion.div 
            className="group-data-[collapsible=icon]:hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            transition={{ delay: 0.5, duration: 0.4 }}
        >
             {/* Placeholder for user avatar or settings icon */}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
