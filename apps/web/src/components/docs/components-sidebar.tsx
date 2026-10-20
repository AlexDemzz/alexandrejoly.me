import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@portfolio/ui/components/sidebar";
import { textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { REGISTRY_ITEMS } from "@/lib/registry";
import type { RegistryItemName } from "@/lib/registry";

export const ComponentsSidebar = ({
  current,
}: {
  current: RegistryItemName;
}) => {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    // Mobile hydrates as desktop, so the column hides itself below md.
    <Sidebar className="sticky top-0 hidden h-svh md:flex" collapsible="none">
      <SidebarContent>
        <SidebarGroup className="md:mt-4">
          {/* On mobile the page header keeps the Home link beside the trigger. */}
          {isMobile ? (
            <SidebarGroupLabel
              render={({ children, ...props }) => (
                <h2 {...props}>{children}</h2>
              )}
            >
              Components
            </SidebarGroupLabel>
          ) : (
            <Link
              className={textLinkVariants({ className: "self-start" })}
              to="/"
            >
              <ArrowLeftIcon aria-hidden />
              Home
            </Link>
          )}
          <SidebarGroupContent>
            <SidebarMenu aria-label="Components">
              {REGISTRY_ITEMS.map(({ name, title }) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton
                    isActive={name === current}
                    onClick={() => setOpenMobile(false)}
                    render={<Link params={{ name }} to="/components/$name" />}
                  >
                    {title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
