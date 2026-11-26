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

const topAccentStyles = {
  default: 'border-t-2 border-t-foreground/80',
  critical: 'border-t-2 border-t-scarlet',
  warning: 'border-t-2 border-t-amber-600',
  positive: 'border-t-2 border-t-jungle',
  hero: 'border-t-2 border-t-scarlet',
};

const iconColorStyles = {
  default: 'text-muted-foreground',
  critical: 'text-scarlet',
  warning: 'text-amber-600',
  positive: 'text-jungle',
  hero: 'text-scarlet',
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
    <div
      className={`rounded-md border border-border bg-card p-5 flex flex-col gap-3 ${topAccentStyles[variant]} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="stat-label">{label}</p>
        <Icon
          name={icon as Parameters<typeof Icon>[0]['name']}
          size={16}
          variant={iconVariant}
          className={iconColorStyles[variant]}
        />
      </div>
      <div>
        <p className="text-hero-metric font-tabular text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
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
                  ? 'text-jungle'
                  : 'text-scarlet'
                : trend.direction === 'up'
                ? 'text-scarlet'
                : 'text-jungle'
            }
          />
          <span
            className={`text-xs font-semibold ${
              trend.direction === 'neutral'
                ? 'text-muted-foreground'
                : trend.positive
                ? trend.direction === 'up'
                  ? 'text-jungle'
                  : 'text-scarlet'
                : trend.direction === 'up'
                ? 'text-scarlet'
                : 'text-jungle'
            }`}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
