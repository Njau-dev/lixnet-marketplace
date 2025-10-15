import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string, e: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        setOpenDropdowns(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const isItemActive = (item: NavItem) => {
        if (item.items) {
            return item.items.some(subItem =>
                page.url.startsWith(typeof subItem.href === 'string' ? subItem.href : subItem.href.url)
            );
        }
        return page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <div key={item.title}>
                        <SidebarMenuItem>
                            {item.dropdown ? (
                                <SidebarMenuButton
                                    onClick={(e: React.MouseEvent) => toggleDropdown(item.title, e)}
                                    isActive={isItemActive(item)}
                                    tooltip={{ children: item.title }}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                        isActive={isItemActive(item)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>

                        {/* Dropdown items */}
                        {item.dropdown && item.items && openDropdowns[item.title] && (
                            <div className="pl-4">
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isItemActive(subItem)}
                                            tooltip={{ children: subItem.title }}
                                        >
                                            <Link href={subItem.href} prefetch>
                                                {subItem.icon && <subItem.icon />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
