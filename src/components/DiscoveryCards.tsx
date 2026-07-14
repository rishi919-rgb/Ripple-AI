import React from 'react';
import { 
  MapPin, 
  Compass, 
  Waves, 
  Trees, 
  Wheat, 
  Activity,
  Globe
} from 'lucide-react';
import { Card, GlassPanel } from '@/components';
import type { OriginData, HabitatData, SpeciesData } from '@/core/discovery/DiscoveryEngine';

// 1. Base DiscoveryCard
interface DiscoveryCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  return (
    <Card bordered glow className={`space-y-4 bg-bg-panel/20 ${className}`}>
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent-cyan">{icon}</span>}
          <h3 className="text-xs font-mono tracking-wider text-text-primary uppercase">
            {title}
          </h3>
        </div>
        {subtitle && (
          <span className="text-[10px] font-mono text-text-secondary bg-bg-dark px-2.5 py-0.5 rounded border border-border-subtle">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </Card>
  );
};

// 2. OriginCard
interface OriginCardProps {
  origins: OriginData[];
}

export const OriginCard: React.FC<OriginCardProps> = ({ origins }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {origins.map((origin) => (
        <GlassPanel key={origin.ingredient} intensity="light" className="p-5 border border-border-subtle/80 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-text-muted uppercase">Ingredient Origin</span>
              <h4 className="text-sm font-semibold text-text-primary font-mono">{origin.ingredient}</h4>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-accent-cyan bg-bg-dark border border-border-subtle px-2 py-1 rounded">
              <MapPin className="w-3 h-3 text-accent-cyan" />
              <span>{origin.state.toUpperCase()}</span>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {origin.description}
          </p>
        </GlassPanel>
      ))}
    </div>
  );
};

// 3. HabitatCard
interface HabitatCardProps {
  habitat: HabitatData;
}

export const HabitatCard: React.FC<HabitatCardProps> = ({ habitat }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Waves':
        return <Waves className="w-6 h-6 text-accent-cyan" />;
      case 'Trees':
        return <Trees className="w-6 h-6 text-accent-cyan" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-accent-cyan" />;
      default:
        return <Wheat className="w-6 h-6 text-accent-cyan" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Description Panel */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-bg-dark border border-border-subtle rounded-xl shadow-sm">
            {getIcon(habitat.iconName)}
          </div>
          <div>
            <span className="text-[9px] font-mono text-text-muted uppercase">Ecosystem Classification</span>
            <h4 className="text-base font-bold text-text-primary font-mono">{habitat.name}</h4>
          </div>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed bg-bg-darkest/40 border border-border-subtle rounded-lg p-3">
          {habitat.description}
        </p>
      </div>

      {/* Core Features list */}
      <GlassPanel intensity="light" className="p-5 border border-border-subtle/80 flex flex-col justify-center space-y-3">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block border-b border-border-subtle pb-2">
          Diagnostic Indicators
        </span>
        <ul className="space-y-2 text-[11px] font-mono text-text-secondary">
          {habitat.features.map((feature, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="text-accent-cyan font-bold">•</span>
              <span>{feature.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
};

// 4. SpeciesCard
interface SpeciesCardProps {
  species: SpeciesData[];
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species }) => {
  const getStatusColor = (status: SpeciesData['status']) => {
    switch (status) {
      case 'Critically Endangered':
        return 'bg-status-danger/10 text-status-danger border-status-danger/25';
      case 'Endangered':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/25';
      case 'Vulnerable':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/25';
      default:
        return 'bg-status-coming-soon/10 text-status-coming-soon border-status-coming-soon/25';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {species.map((sp) => (
        <Card key={sp.name} bordered className="bg-bg-panel/10 hover:border-border-active transition-all duration-200 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            {/* Image Placeholder */}
            <div className="w-full h-32 rounded-lg bg-bg-darkest border border-border-subtle flex items-center justify-center relative overflow-hidden group">
              {/* Minimal geometric line decor */}
              <div className="absolute inset-0 bg-gradient-to-tr from-bg-panel/40 to-transparent opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-border-subtle" />
              <Globe className="w-8 h-8 text-text-muted/40 group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-text-primary font-mono">{sp.name}</h4>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono border shrink-0 ${getStatusColor(sp.status)}`}>
                  {sp.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] italic text-text-secondary font-mono">{sp.scientificName}</p>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {sp.description}
            </p>
          </div>

          <div className="flex gap-2 items-center text-[10px] font-mono text-text-muted border-t border-border-subtle pt-3">
            <Activity className="w-3.5 h-3.5 text-accent-cyan" />
            <span>NICHE:</span>
            <span className="text-text-secondary truncate">{sp.role.toUpperCase()}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
