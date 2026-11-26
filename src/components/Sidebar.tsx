'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useTelephony } from '@/context/TelephonyContext';
import { useCurrentUser, UserRole } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface NavItem {
  label: string;
  href?: string;
  action?: 'open_ussd' | 'open_voice';
  icon: string;
  badge?: number | string;
  badgeVariant?: 'critical' | 'warning' | 'info' | 'primary';
  roles?: UserRole[];
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupLabel: 'Operations',
    items: [
      {
        label: 'Hospital Capacity',
        href: '/capacity',
        icon: 'BuildingOffice2Icon',
        badge: 2,
        badgeVariant: 'critical',
        roles: ['BED_MANAGER', 'BLOOD_BANK_OFFICER', 'CLINIC_NURSE', 'COUNTY_DIRECTOR', 'SYSTEM_ADMIN'],
      },
      {
        label: 'Patient Monitoring',
        href: '/patient-risk-monitoring',
        icon: 'HeartIcon',
        badge: 5,
        badgeVariant: 'critical',
        roles: ['CLINIC_NURSE', 'SYSTEM_ADMIN'],
      },
      {
        label: 'Facility Referrals',
        href: '/emergency-referral-management',
        icon: 'ArrowsRightLeftIcon',
        badge: 3,
        badgeVariant: 'warning',
        roles: ['CLINIC_NURSE', 'BED_MANAGER', 'COUNTY_DIRECTOR', 'SYSTEM_ADMIN'],
      },
      {
        label: 'Community Mothers',
        href: '/mothers',
        icon: 'UsersIcon',
        roles: ['COMMUNITY_PROMOTER', 'CLINIC_NURSE', 'SYSTEM_ADMIN'],
      },
    ],
  },
  {
    groupLabel: 'Intelligence & Telephony',
    items: [
      {
        label: 'Voice AI Handset',
        action: 'open_voice',
        icon: 'PhoneIcon',
        roles: ['CLINIC_NURSE', 'COMMUNITY_PROMOTER', 'SYSTEM_ADMIN'],
      },
      {
        label: 'USSD Dialer (*384#)',
        action: 'open_ussd',
        icon: 'RadioIcon',
        roles: ['CLINIC_NURSE', 'COMMUNITY_PROMOTER', 'SYSTEM_ADMIN'],
      },
      {
        label: 'MPDSR Surveillance',
        href: '/surveillance',
        icon: 'DocumentChartBarIcon',
        roles: ['COUNTY_DIRECTOR', 'BED_MANAGER', 'SYSTEM_ADMIN'],
      },
    ],
  },
  {
    groupLabel: 'Network & System',
    items: [
      {
        label: 'Referral Facilities',
        href: '/facilities',
        icon: 'BuildingOfficeIcon',
        roles: ['BED_MANAGER', 'BLOOD_BANK_OFFICER', 'COUNTY_DIRECTOR', 'SYSTEM_ADMIN'],
      },
      {
        label: 'Primary Clinics',
        href: '/clinics',
        icon: 'HomeModernIcon',
        roles: ['COUNTY_DIRECTOR', 'SYSTEM_ADMIN'],
      },
      {
        label: 'Mother Pass Preview',
        href: '/my-pregnancy/1',
        icon: 'DevicePhoneMobileIcon',
        roles: ['CLINIC_NURSE', 'COMMUNITY_PROMOTER', 'SYSTEM_ADMIN'],
      },
      {
        label: 'HIMS Integrations',
        href: '/integrations',
        icon: 'CommandLineIcon',
        roles: ['SYSTEM_ADMIN'],
      },
      {
        label: 'Manage Staff Roles',
        href: '/admin/users',
        icon: 'UserGroupIcon',
        roles: ['SYSTEM_ADMIN'],
      },
    ],
  },
];

const badgeColors: Record<string, string> = {
  critical: 'bg-critical text-white',
  warning: 'bg-accent text-white',
  info: 'bg-info text-white',
  primary: 'bg-primary text-primary-foreground',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { openDrawer } = useTelephony();
  const currentUser = useCurrentUser();
  const { theme, toggleTheme } = useTheme();

  // Filter groups according to current role permissions
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(currentUser.role)),
    }))
    .filter((group) => group.items.length > 0);

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'open_ussd') {
      openDrawer('ussd');
    } else if (item.action === 'open_voice') {
      openDrawer('voice');
    }
  };

  return (
    <aside
      className="flex flex-col h-screen bg-background border-r border-border transition-all duration-300 ease-in-out flex-shrink-0"
      style={{ width: collapsed ? 64 : 252 }}
    >
      {/* Logo */}
      <Link
        href="/"
        aria-label="seqoy home"
        className="flex items-center gap-2.5 px-4 py-3 border-b border-border h-16 hover:bg-secondary/60 transition-colors"
      >
        <div className="flex-shrink-0">
          <AppLogo size={34} />
        </div>
        {!collapsed && (
          <div className="flex flex-col pt-0.5">
            <span className="font-semibold text-xl text-navy dark:text-white tracking-[-0.02em] leading-none whitespace-nowrap overflow-hidden">
              seqoy
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-[0.12em] uppercase mt-1">
              Maternal Network
            </span>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2.5">
        {filteredGroups.map((group) => (
          <div key={`group-${group.groupLabel}`} className="mb-5">
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                {group.groupLabel}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.href ? pathname === item.href : false;

                if (item.action) {
                  return (
                    <li key={`nav-${item.label}`}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className="w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 text-foreground/75 hover:bg-secondary hover:text-foreground group relative"
                      >
                        <span className="flex-shrink-0">
                          <Icon
                            name={item.icon as Parameters<typeof Icon>[0]['name']}
                            size={17}
                            variant="outline"
                            className="text-jungle"
                          />
                        </span>
                        {!collapsed && (
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        )}
                        {collapsed && (
                          <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                            {item.label}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={`nav-${item.href}-${item.label}`}>
                    <Link
                      href={item.href || '#'}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] transition-colors duration-150 group relative ${
                        isActive
                          ? 'bg-scarlet-soft text-scarlet font-bold border-l-2 border-scarlet rounded-l-none'
                          : 'font-medium text-foreground/75 hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <span className="flex-shrink-0">
                        <Icon
                          name={item.icon as Parameters<typeof Icon>[0]['name']}
                          size={17}
                          variant={isActive ? 'solid' : 'outline'}
                          className={isActive ? 'text-scarlet' : 'text-foreground/55 group-hover:text-foreground'}
                        />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                badgeColors[item.badgeVariant ?? 'info']
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-scarlet" />
                      )}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile & Facility Badge */}
      <div className="border-t border-border p-3 space-y-1.5">
        <Link
          href="/profile"
          className="w-full flex items-center gap-2.5 p-2 rounded-md bg-secondary/60 hover:bg-secondary border border-border transition text-left group"
          title="View Clinical Profile & Credentials"
        >
          <div className="w-8 h-8 rounded-md bg-jungle text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.avatarInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-scarlet transition">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser.roleTitle}</p>
            </div>
          )}
        </Link>

        <button
          onClick={() => openDrawer('ussd')}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground/75 hover:bg-secondary hover:text-foreground transition-colors"
          title="Open GSM 2G Feature Phone Handset"
        >
          <Icon name="DevicePhoneMobileIcon" size={15} variant="outline" className="text-jungle" />
          {!collapsed && <span>Feature Phone Handset</span>}
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground/75 hover:bg-secondary hover:text-foreground transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Day' : 'Night'} Mode`}
        >
          <Icon
            name={theme === 'dark' ? 'SunIcon' : 'MoonIcon'}
            size={15}
            variant="outline"
            className="text-foreground/60"
          />
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={14}
            variant="outline"
          />
          {!collapsed && <span className="text-[11px] font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
