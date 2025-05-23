"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Default expanded width
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "4rem" // Width when collapsed to icon-only

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
                ?.split('=')[1];
            if (cookieValue) {
                return cookieValue === 'true';
            }
        }
        return defaultOpen;
    });
    
    const open = openProp ?? _open
    
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof window !== 'undefined') {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open, _setOpen] // Added _setOpen to dependencies
    )

    React.useEffect(() => {
        // Sync with cookie on mount if not controlled
        if (openProp === undefined && typeof window !== 'undefined') {
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
                ?.split('=')[1];
            if (cookieValue) {
                const cookieOpenState = cookieValue === 'true';
                if (_open !== cookieOpenState) {
                    _setOpen(cookieOpenState);
                }
            }
        }
    }, [openProp, _open]);


    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((openVal) => !openVal)
        : setOpen((openVal) => !openVal)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === "b" && // Using 'b' as a common shortcut, ensure it doesn't conflict
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", // Ensure sidebar theme colors apply
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none" // 'icon' means collapse to icon-only bar
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default to standard sidebar variant
      collapsible = "icon", // Default to icon collapse
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") { // Non-collapsible sidebar
      return (
        <div
          className={cn(
            "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", // Added border
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Mobile sidebar (uses Sheet)
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[var(--sidebar-width-mobile)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Adjusted width variable
            style={
              {
                "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop sidebar (collapsible or offcanvas)
    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground sticky top-0 h-svh" // Made sticky and full height
        data-state={state}
        data-collapsible={collapsible} // Use this to control icon-only collapse
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            "relative h-full bg-transparent transition-[width] duration-300 ease-in-out",
            state === 'expanded' ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
            "group-data-[collapsible=offcanvas]:w-0", // Handles offcanvas specific collapse
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-30 flex h-full transition-[left,right,width] duration-300 ease-in-out",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            state === 'expanded' ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
            variant === "floating" || variant === "inset"
              ? "p-2" // floating/inset specific padding
              : (side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border"), // Standard sidebar border
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar" // Use this attribute for styling
            className={cn(
                "flex h-full w-full flex-col bg-sidebar",
                variant === "floating" && "rounded-lg border border-sidebar-border shadow-lg" // Floating styles
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  if (!isMobile) return null; // Only show trigger on mobile for this setup

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 text-foreground", className)} // Adjusted size
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-5 w-5"/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// SidebarRail might not be needed if using icon collapse primarily. Keeping for completeness.
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state, isMobile } = useSidebar()

  if (isMobile) return null; // Rail is for desktop

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        state === "collapsed" && "[[data-side=left]_&]:cursor-e-resize [[data-side=right]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"


const SidebarInset = React.forwardRef<
  HTMLDivElement, // Changed from main to div for flexibility
  React.HTMLAttributes<HTMLDivElement> // Changed from main to div attributes
>(({ className, ...props }, ref) => {
  return (
    <div // Changed from main to div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto bg-background", // Ensure it grows and handles overflow
        // The peer styling for margin is now handled in layout.tsx based on sidebar state
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-9 w-full bg-sidebar-accent/10 text-sidebar-foreground border-sidebar-border shadow-none focus-visible:ring-1 focus-visible:ring-sidebar-ring placeholder:text-sidebar-foreground/60",
        "group-data-[collapsible=icon]:hidden", // Hide input when collapsed to icon
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3", className)} // Standardized padding
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3 mt-auto", className)} // Standardized padding, mt-auto to push to bottom
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 my-1 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-1", // Adjusted gap and padding
        "group-data-[collapsible=icon]:items-center", // Center items when icon-only
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col px-2 py-1", className)} // Adjusted padding
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold text-sidebar-foreground/70 outline-none ring-sidebar-ring focus-visible:ring-1",
        "group-data-[collapsible=icon]:sr-only", // Hide label text when icon-only, keep for ARIA
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-2 top-2.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)} // Base styles
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Adjusted gap
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li"> & { asChild?: boolean }
>(({ className, asChild: isSlot = false, children, ...rest }, ref) => {
  const Comp = isSlot ? Slot : "li";
  return (
    <Comp
      ref={ref}
      className={cn("group/menu-item relative", className)}
      data-sidebar="menu-item"
      {...rest}
    >
      {children}
    </Comp>
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";


const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: // Outline might not be typical for sidebar buttons, keeping for consistency if needed
          "bg-transparent border border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
      size: { // Size variants might be less common for sidebar, default usually suffices
        default: "h-9 text-sm",
        sm: "h-8 text-xs",
        lg: "h-10 text-sm", // Adjusted lg
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Can also be 'a' if using Link asChild
  React.ButtonHTMLAttributes<HTMLButtonElement> & // Or React.AnchorHTMLAttributes<HTMLAnchorElement>
  {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild: isSlot = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, // Added children to pass icon and text
      ...rest // Use rest for remaining props
    },
    ref
  ) => {
    const Comp = isSlot ? Slot : "button"
    const { isMobile, state: sidebarState } = useSidebar() // Get sidebar state, removed 'open' as 'state' is preferred


    const buttonElement = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive} // Pass active state for styling
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...rest} // Spread rest
      >
        {children}
      </Comp>
    )

    if (!tooltip || isMobile || sidebarState === "expanded") { // Hide tooltip if mobile or sidebar expanded
      return buttonElement
    }
    
    const tooltipContent = typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          className="ml-2" // Add some margin when icon-only
          {...tooltipContent}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1.5 top-1/2 -translate-y-1/2 flex aspect-square w-6 h-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-1 after:md:hidden", // Larger hit area on mobile
        "peer-data-[size=sm]/menu-button:top-1/2",
        "peer-data-[size=default]/menu-button:top-1/2",
        "peer-data-[size=lg]/menu-button:top-1/2",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums text-sidebar-accent-foreground bg-sidebar-accent select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      // Adjust based on button size if needed, this is generic for default
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"


const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = true, ...props }, ref) => { // Default showIcon to true
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 30) + 60}%` // Random width between 60-90%
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-9 flex gap-2.5 px-2 items-center", className)} // Matched SidebarMenuButton height and padding
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-5 rounded-md bg-sidebar-border" // Use sidebar theme colors
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[var(--skeleton-width)] bg-sidebar-border group-data-[collapsible=icon]:hidden" // Hide text skeleton when icon-only
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub" // For sub-menu specific styling
    className={cn(
      "ml-[calc(theme(spacing.2)_+theme(spacing.5))] flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border pl-2.5 py-1", // Indent and style for sub-menu
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => ( // Added className to props
    <li 
        ref={ref} 
        className={cn("relative", className)} // Added relative for potential badges/actions
        {...props} 
    />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"


const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, // Assuming it's an anchor, adjust if button
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { // Or ButtonHTMLAttributes
    asChild?: boolean
    size?: "sm" | "default" // Consistent with other buttons
    isActive?: boolean
  }
>(({ asChild = false, size = "default", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a" // Or "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-sidebar-foreground/90 outline-none ring-sidebar-ring hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/70",
        "data-[active=true]:bg-sidebar-accent/90 data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium",
        size === "sm" ? "text-xs h-7" : "text-sm h-8", // Adjusted sizes
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}