'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useTelephony } from '@/context/TelephonyContext';
import { useAuth, UserRole } from '@/context/AuthContext';
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
        href: '/',
        icon: 'BuildingOffice2Icon',
        badge: 2,
        badgeVariant: 'critical',
      },
      {
        label: 'Patient Monitoring',
        href: '/patient-risk-monitoring',
        icon: 'HeartIcon',
        badge: 5,
        badgeVariant: 'critical',
      },
      {
        label: 'Emergency Referrals',
        href: '/emergency-referral-management',
        icon: 'TruckIcon',
        badge: 3,
        badgeVariant: 'warning',
      },
    ],
  },
  {
    groupLabel: 'Intelligence',
    items: [
      { label: 'Voice AI Handset', action: 'open_voice', icon: 'PhoneIcon' },
      { label: 'USSD Dialer (*384#)', action: 'open_ussd', icon: 'RadioIcon' },
      { label: 'MPDSR Surveillance', href: '/surveillance', icon: 'DocumentChartBarIcon' },
    ],
  },
  {
    groupLabel: 'Network',
    items: [
      { label: 'Referral Facilities', href: '/facilities', icon: 'BuildingOfficeIcon' },
      { label: 'Primary Clinics', href: '/clinics', icon: 'HomeModernIcon' },
      { label: 'Expectant Mothers', href: '/mothers', icon: 'UsersIcon' },
      { label: 'HIMS Integrations', href: '/integrations', icon: 'CommandLineIcon' },
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
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'open_ussd') {
      openDrawer('ussd');
    } else if (item.action === 'open_voice') {
      openDrawer('voice');
    }
  };

  return (
    <aside
      className="flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0"
      style={{ width: collapsed ? 64 : 255 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border h-16">
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-base text-foreground tracking-tight whitespace-nowrap overflow-hidden">
              SEQOY
            </span>
            <span className="text-[10px] text-primary font-medium tracking-wide">Maternal Network</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.map((group) => (
          <div key={`group-${group.groupLabel}`} className="mb-4">
            {!collapsed && (
              <p className="stat-label px-2 mb-1 text-[10px]">{group.groupLabel}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.href ? pathname === item.href : false;

                if (item.action) {
                  return (
                    <li key={`nav-${item.label}`}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className="w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-secondary-foreground hover:bg-muted hover:text-foreground group relative"
                      >
                        <span className="flex-shrink-0">
                          <Icon
                            name={item.icon as Parameters<typeof Icon>[0]['name']}
                            size={18}
                            variant="outline"
                            className="text-primary"
                          />
                        </span>
                        {!collapsed && (
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        )}
                        {collapsed && (
                          <span className="absolute left-full ml-2 px-2 py-1 bg-muted text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 border border-border">
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
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-secondary-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="flex-shrink-0">
                        <Icon
                          name={item.icon as Parameters<typeof Icon>[0]['name']}
                          size={18}
                          variant={isActive ? 'solid' : 'outline'}
                          className={isActive ? 'text-primary' : ''}
                        />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                badgeColors[item.badgeVariant ?? 'info']
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-critical" />
                      )}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-muted text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 border border-border">
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
      <div className="border-t border-border p-2.5 space-y-1.5">
        {/* Clinician Card */}
        <Link
          href="/profile"
          className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 hover:bg-muted border border-border transition text-left group"
          title="View Clinical Profile & Credentials"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${currentUser.avatarColor}`}
          >
            {currentUser.avatarInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.roleTitle}</p>
            </div>
          )}
        </Link>

        {/* Quick Phone Handset Trigger */}
        <button
          onClick={() => openDrawer('ussd')}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-secondary-foreground hover:bg-muted hover:text-foreground transition-all duration-150 group"
          title="Open GSM 2G Feature Phone Handset"
        >
          <Icon name="DevicePhoneMobileIcon" size={16} variant="outline" className="text-primary" />
          {!collapsed && <span className="text-[11px]">Feature Phone Handset</span>}
        </button>

        {/* Day / Night Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-secondary-foreground hover:bg-muted hover:text-foreground transition-all duration-150 group"
          title={`Switch to ${theme === 'dark' ? 'Day' : 'Night'} Mode`}
        >
          <Icon
            name={theme === 'dark' ? 'SunIcon' : 'MoonIcon'}
            size={16}
            variant="outline"
            className={theme === 'dark' ? 'text-amber-400' : 'text-primary'}
          />
          {!collapsed && (
            <span className="text-[11px]">
              {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-95"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={14}
            variant="outline"
          />
          {!collapsed && <span className="text-[11px]">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
}
