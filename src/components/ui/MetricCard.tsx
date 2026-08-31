import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral'; positive?: boolean };
  icon: string;
  iconVariant?: 'outline' | 'solid';
  variant?: 'default' | 'critical' | 'warning' | 'positive' | 'hero';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border card-glow-primary',
  critical: 'bg-card border-critical/30 card-glow-critical',
  warning: 'bg-card border-accent/30 card-glow-warning',
  positive: 'bg-card border-primary/30 card-glow-primary',
  hero: 'bg-gradient-to-br from-primary/10 to-card border-primary/20 card-glow-primary',
};

const iconBgStyles = {
  default: 'bg-muted text-muted-foreground',
  critical: 'bg-critical/15 text-critical',
  warning: 'bg-accent/15 text-accent',
  positive: 'bg-primary/15 text-primary',
  hero: 'bg-primary/20 text-primary',
};

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  icon,
  iconVariant = 'outline',
  variant = 'default',
  className = '',
}: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <p className="stat-label">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBgStyles[variant]}`}>
          <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={18} variant={iconVariant} />
        </div>
      </div>
      <div>
        <p className="text-hero-metric font-tabular">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5">
          <Icon
            name={
              trend.direction === 'up' ? 'ArrowUpIcon' : trend.direction === 'down' ? 'ArrowDownIcon' : 'MinusIcon'
            }
            size={12}
            variant="solid"
            className={
              trend.direction === 'neutral'
                ? 'text-muted-foreground'
                : trend.positive
                ? trend.direction === 'up'
                  ? 'text-primary'
                  : 'text-critical'
                : trend.direction === 'up'
                ? 'text-critical'
                : 'text-primary'
            }
          />
          <span
            className={`text-xs font-medium ${
              trend.direction === 'neutral'
                ? 'text-muted-foreground'
                : trend.positive
                ? trend.direction === 'up'
                  ? 'text-primary'
                  : 'text-critical'
                : trend.direction === 'up'
                ? 'text-critical'
                : 'text-primary'
            }`}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
