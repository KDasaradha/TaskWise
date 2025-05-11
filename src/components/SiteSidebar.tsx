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
} from '@/components/ui/sidebar';
import { Zap, LayoutDashboard, BarChart3, Info } from 'lucide-react'; 
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home', icon: <Zap size={20} /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { href: '/about', label: 'About', icon: <Info size={20} /> },
];

const menuButtonVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: { 
    scale: 1.02, 
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.98 }
};


export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="shadow-lg">
      <SidebarHeader className="p-4 border-b border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Zap className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300 shrink-0" />
          <motion.span 
            className="text-2xl font-bold text-gradient-primary group-data-[collapsible=icon]:hidden transition-colors duration-300 origin-left"
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.8 }} 
            transition={{ delay: 0.1, duration: 0.3, ease: "circOut" }}
          >
            TaskWise
          </motion.span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2.5"> 
        <SidebarMenu>
          {navLinks.map((link, index) => (
            <SidebarMenuItem key={link.href} asChild className="my-0.5"> 
              <motion.div
                custom={index}
                variants={menuButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.05 * index, type: "spring", stiffness: 350, damping: 25 }}
              >
                <Link href={link.href}>
                  <SidebarMenuButton
                    className={cn(
                      "w-full justify-start gap-3.5 rounded-lg text-base font-medium py-2.5 px-3", 
                      pathname === link.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground", 
                      "group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:px-2.5" 
                    )}
                    tooltip={{
                      children: link.label,
                      className: "bg-popover text-popover-foreground shadow-md rounded-md text-xs",
                      sideOffset: 10, 
                    }}
                  >
                    <span className="group-data-[collapsible=icon]:mx-auto shrink-0">{link.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden truncate">{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3.5 border-t border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
        <ThemeToggle />
        <motion.div 
            className="group-data-[collapsible=icon]:hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity:0, width:0 }} 
            transition={{ delay: 0.3, duration: 0.3 }}
        >
             {/* Future: User avatar or settings button */}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
