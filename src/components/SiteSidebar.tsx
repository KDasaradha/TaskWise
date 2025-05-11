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
import { Zap, LayoutDashboard, BarChart3, Info, Settings, HelpCircle } from 'lucide-react'; 
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const mainNavLinks = [
  { href: '/', label: 'Home', icon: <Zap size={18} /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
];

const secondaryNavLinks = [
  { href: '/about', label: 'About TaskWise', icon: <Info size={18} /> },
  // Future links example:
  // { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  // { href: '/help', label: 'Help & Support', icon: <HelpCircle size={18} /> },
];

const menuButtonVariants = {
  initial: { opacity: 0, x: -15 },
  animate: { opacity: 1, x: 0 },
  hover: { 
    scale: 1.01, 
    backgroundColor: "hsl(var(--sidebar-accent) / 0.15)",
    transition: { duration: 0.1 }
  },
  tap: { scale: 0.98 }
};

export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar 
        variant="sidebar" 
        collapsible="icon" 
        className="shadow-lg border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="p-3.5 border-b border-sidebar-border/60 flex items-center group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-200 shrink-0 drop-shadow-sm" />
          <motion.span 
            className="text-xl font-bold text-gradient-primary group-data-[collapsible=icon]:hidden transition-opacity duration-200 origin-left"
            initial={{ opacity: 0, scaleX: 0.9 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.9 }} 
            transition={{ delay: 0.05, duration: 0.25, ease: "circOut" }}
          >
            TaskWise
          </motion.span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="flex-grow p-2 space-y-4"> 
        <SidebarMenu>
          {mainNavLinks.map((link, index) => (
            <SidebarMenuItem key={link.href} asChild className="my-[1px]"> 
              <motion.div
                custom={index}
                variants={menuButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.03 * index, type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link href={link.href}>
                  <SidebarMenuButton
                    className={cn(
                      "w-full justify-start gap-3 rounded-md text-sm font-medium py-2 px-2.5", 
                      pathname === link.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground", 
                      "group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-2" 
                    )}
                    tooltip={{
                      children: link.label,
                      className: "bg-popover text-popover-foreground shadow-md rounded-md text-xs border-border/50",
                      sideOffset: 12, 
                      align: "center",
                    }}
                  >
                    <span className="group-data-[collapsible=icon]:mx-auto shrink-0 opacity-90">{link.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden truncate">{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {/* Secondary Navigation (e.g., About, Settings) */}
        {secondaryNavLinks.length > 0 && (
          <div className="pt-2">
             <span className="px-3 text-[0.65rem] font-semibold uppercase text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden tracking-wider">
                Resources
            </span>
            <SidebarMenu className="mt-1">
              {secondaryNavLinks.map((link, index) => (
                <SidebarMenuItem key={link.href} asChild className="my-[1px]">
                  <motion.div
                    custom={index + mainNavLinks.length} // Offset delay for secondary links
                    variants={menuButtonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: 0.03 * (index + mainNavLinks.length), type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link href={link.href}>
                      <SidebarMenuButton
                        className={cn(
                          "w-full justify-start gap-3 rounded-md text-sm font-medium py-2 px-2.5",
                          pathname === link.href
                            ? "bg-sidebar-accent/80 text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground/90",
                          "group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-2"
                        )}
                        tooltip={{
                          children: link.label,
                          className: "bg-popover text-popover-foreground shadow-md rounded-md text-xs border-border/50",
                          sideOffset: 12,
                          align: "center",
                        }}
                      >
                        <span className="group-data-[collapsible=icon]:mx-auto shrink-0 opacity-80">{link.icon}</span>
                        <span className="group-data-[collapsible=icon]:hidden truncate">{link.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2.5 border-t border-sidebar-border/60 flex items-center group-data-[collapsible=icon]:justify-center">
        <ThemeToggle />
        <motion.div 
            className="group-data-[collapsible=icon]:hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity:0, width:0 }} 
            transition={{ delay: 0.1, duration: 0.2 }}
        >
             {/* Placeholder for user avatar or settings button */}
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
