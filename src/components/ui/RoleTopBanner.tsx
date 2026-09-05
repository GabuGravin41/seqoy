'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function RoleTopBanner() {
  const { currentUser, switchRole, personas } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setDropdownOpen(false);
    const targetPersona = personas.find((p) => p.role === role);
    if (targetPersona) {
      toast.success(`Switched role to: ${targetPersona.roleTitle}`, {
        description: `Facility: ${targetPersona.facilityName}`,
      });
      if (targetPersona.primaryRoute) {
        router.push(targetPersona.primaryRoute);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Persona & Facility Identification */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border shadow-xs ${currentUser.avatarColor}`}
        >
          {currentUser.avatarInitials}
        </div>

        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground truncate">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 shrink-0">
              {currentUser.roleTitle}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
            <span className="text-border">|</span>
            <Icon name="BuildingOfficeIcon" size={13} variant="outline" className="shrink-0" />
            <span className="truncate">{currentUser.facilityName}</span>
          </div>
        </div>
      </div>

      {/* Right: Instant Role Switcher for Demos & Access Level */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-secondary-foreground transition shadow-xs active:scale-95"
            title="Switch Active Clinical Persona"
          >
            <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" className="text-primary" />
            <span className="hidden md:inline">Switch Cadre / Role</span>
            <span className="md:hidden">Role</span>
            <Icon
              name="ChevronDownIcon"
              size={12}
              variant="outline"
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Persona Selection Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground">Interactive Clinical Cadre Switcher</p>
                <p className="text-[10px] text-muted-foreground">
                  Select any persona to test how UI and navigation adapt to specific clinical responsibilities.
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto scrollbar-thin py-1 space-y-1">
                {personas.map((persona) => {
                  const isSelected = persona.role === currentUser.role;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleRoleSelect(persona.role)}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/60 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 border ${persona.avatarColor}`}
                      >
                        {persona.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-foreground truncate">{persona.roleTitle}</p>
                          {isSelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{persona.name} · {persona.facilityName}</p>
                        <p className="text-[10px] text-secondary-foreground/80 line-clamp-1 mt-0.5">
                          {persona.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 px-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                <span>7 Core Network Personas</span>
                <span className="text-primary font-medium">Role-Based Access Enforced</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
