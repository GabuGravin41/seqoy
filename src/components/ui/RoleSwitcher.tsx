'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function RoleSwitcher() {
  const { currentUser, switchRole, personas } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
    toast.success(`Switched active view to ${role.replace(/_/g, ' ')}`, {
      description: `Logged in as ${personas.find((p) => p.role === role)?.name} (${personas.find((p) => p.role === role)?.facilityName})`,
    });
  };

  return (
    <>
      {/* Switcher Button Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border transition-all duration-150 text-left group"
        title="Switch active user role"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${currentUser.avatarColor}`}
          >
            {currentUser.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{currentUser.roleTitle}</p>
          </div>
        </div>
        <Icon
          name="ArrowsUpDownIcon"
          size={14}
          variant="outline"
          className="text-muted-foreground group-hover:text-primary flex-shrink-0"
        />
      </button>

      {/* Role Selection Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Switch User Persona & Role"
        description="Select a role to preview SEQOY's role-tailored clinical interfaces and permissions."
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {personas.map((persona) => {
            const isCurrent = currentUser.role === persona.role;
            return (
              <div
                key={persona.role}
                onClick={() => handleSelectRole(persona.role)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                    : 'bg-card hover:bg-muted/40 border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${persona.avatarColor}`}
                    >
                      {persona.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">{persona.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-primary font-medium">{persona.roleTitle}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/50 truncate">
                  📍 {persona.facilityName}
                </p>

                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {persona.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button onClick={() => setIsOpen(false)} className="btn-secondary text-xs">
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
