import React from 'react';
import { PageContainer } from '@/components';
import { 
  Database, 
  HelpCircle, 
  Award, 
  ShieldCheck, 
  CheckCircle
} from 'lucide-react';

export const Knowledge: React.FC = () => {
  return (
    <PageContainer size="lg" className="py-10 text-left font-sans text-text-secondary bg-bg-darkest select-none space-y-10">
      
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-panel/40 border border-border-subtle rounded-full text-[10px] tracking-widest text-accent-cyan uppercase">
          <Database className="w-3.5 h-3.5" />
          <span>scientific documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-sans">
          Scientific Reference Guide
        </h1>
        <p className="text-xs text-text-muted max-w-lg leading-relaxed">
          Explore technical data catalogs, index metrics equations, confidence models, and scientific bounds.
        </p>
      </div>

      {/* Grid: BPI & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* BPI card */}
        <div className="p-6 bg-bg-panel/10 border border-border-subtle/70 rounded-3xl space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-accent-cyan">
            <Award className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Biodiversity Pressure Index (BPI)
            </h3>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            The BPI is a deterministic index scaling from 0 to 100. It translates average trophic pressure loads down constituent ingredient food supply chains:
          </p>
          <div className="p-3 bg-bg-darkest/60 border border-border-subtle/40 rounded-xl font-mono text-[9px] text-text-secondary leading-normal">
            BPI = Round( (Sum(Node Trophic Pressure) / Total Nodes) * 100 )
          </div>
          <p className="text-[11.5px] text-text-secondary leading-relaxed">
            Weight vectors integrate fertilizer runoff loads, agricultural blue-water consumption profiles, and soil degradation index mappings.
          </p>
        </div>

        {/* Confidence rating card */}
        <div className="p-6 bg-bg-panel/10 border border-border-subtle/70 rounded-3xl space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Confidence Model Rating
            </h3>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Derived dynamically based on registry credentials and telemetry matches:
          </p>
          <div className="space-y-1.5 text-[10px] text-text-secondary">
            <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> IUCN Red List conservation codes (98% confidence weight)</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> FAOSTAT regional crop suitability (94% confidence weight)</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> GBIF wildlife occurrences (88% confidence weight)</div>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed pt-1">
            Gaps represent unverified spatial coordinates, lowering trust factors down matching edges.
          </p>
        </div>
      </div>

      {/* Datasets section */}
      <div className="space-y-4">
        <h2 className="text-xs font-sans font-bold tracking-widest text-text-primary uppercase border-b border-border-subtle pb-2">
          Connected Repositories & Registries
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-bg-panel/5 border border-border-subtle/40 rounded-2xl flex items-start gap-3">
            <Database className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[11.5px] font-bold text-text-primary">GBIF OCCURRENCE DATASETS</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Aggregates coordinates indexing localized wildlife sightings down downstream watersheds.
              </p>
            </div>
          </div>

          <div className="p-4 bg-bg-panel/5 border border-border-subtle/40 rounded-2xl flex items-start gap-3">
            <Database className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[11.5px] font-bold text-text-primary">IUCN RED LIST INDEX</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Attaches status classifications (Critically Endangered, Endangered, Vulnerable) to species nodes.
              </p>
            </div>
          </div>

          <div className="p-4 bg-bg-panel/5 border border-border-subtle/40 rounded-2xl flex items-start gap-3">
            <Database className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[11.5px] font-bold text-text-primary">WRIS HYDROLOGICAL BASINS</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Determines regional aquifer stress and catchment draft metrics.
              </p>
            </div>
          </div>

          <div className="p-4 bg-bg-panel/5 border border-border-subtle/40 rounded-2xl flex items-start gap-3">
            <Database className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[11.5px] font-bold text-text-primary">FAOSTAT & ICAR CROP COEFFICIENTS</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Provides agricultural baseline footprints (irrigation drafts, fertilizer loading scales).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific FAQ */}
      <div className="space-y-4">
        <h2 className="text-xs font-sans font-bold tracking-widest text-text-primary uppercase border-b border-border-subtle pb-2">
          Methodological FAQ
        </h2>

        <div className="space-y-4 text-left text-[11px] leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="text-[11.5px] font-bold text-text-primary flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
              Does Ripple predict future wildlife population collapse or extinction?
            </h4>
            <p className="text-text-muted pl-5">
              No. The platform utilizes a deterministic pressure propagation model (ERE). It scales consumption pressure delta indicators across edge pathways, providing relative metrics rather than temporal forecast simulations.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11.5px] font-bold text-text-primary flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
              How are ingredients mapped back to crop tracts?
            </h4>
            <p className="text-text-muted pl-5">
              EIE maps canonical meal classifications (Gemini identification) into ingredient matrices, matching agricultural origin records in the crop registries.
            </p>
          </div>
        </div>
      </div>

    </PageContainer>
  );
};
export default Knowledge;
