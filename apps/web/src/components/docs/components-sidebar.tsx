import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@portfolio/ui/components/sidebar";
import { textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { COMPONENTS_PAGE } from "@/content";
import { EXACT_ACTIVE } from "@/lib/link";
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
          {/* On mobile the page header keeps the breadcrumb beside the trigger. */}
          {isMobile ? (
            <button
              className={textLinkVariants({ className: "self-start" })}
              onClick={() => setOpenMobile(false)}
              type="button"
            >
              Close
            </button>
          ) : (
            <Breadcrumb className="self-start">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={
                      <Link activeOptions={EXACT_ACTIVE} to="/components" />
                    }
                  >
                    {COMPONENTS_PAGE.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
