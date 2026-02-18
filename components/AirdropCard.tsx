import React from 'react';
import { Airdrop } from '../types';
import { CheckBadgeIcon, CurrencyDollarIcon, TagIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface AirdropCardProps {
  airdrop: Airdrop;
}

export const AirdropCard: React.FC<AirdropCardProps> = ({ airdrop }) => {
  const statusStyles = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    'Upcoming': 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    'Ended': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
      {/* Gradient Border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 group-hover:from-primary/50 group-hover:via-secondary/50 group-hover:to-primary/50 transition-all duration-500 opacity-50 group-hover:opacity-100" />
      
      {/* Card Content */}
      <div className="relative h-full bg-surface/80 backdrop-blur-xl rounded-2xl p-5 border border-white/5 overflow-hidden flex flex-col">
        {/* Glow blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">
            {airdrop.name}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md ${statusStyles[airdrop.status]}`}>
            {airdrop.status}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm mb-5 relative z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceLight/50 border border-white/5">
            <CurrencyDollarIcon className="w-4 h-4 text-accent" />
            <span className="font-semibold text-slate-200">{airdrop.value}</span>
          </div>
          <div className="flex items-center gap-1 text-primary/80">
              <CheckBadgeIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Verified</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed group-hover:text-slate-300 transition-colors">
          {airdrop.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {airdrop.tags.map(tag => (
              <span key={tag} className="flex items-center text-[10px] font-medium bg-white/5 px-2.5 py-1 rounded-md text-slate-400 border border-white/5 group-hover:border-white/10 transition-colors">
                  <TagIcon className="w-3 h-3 mr-1.5 opacity-50" />
                  {tag}
              </span>
          ))}
        </div>

        <div className="border-t border-white/5 pt-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tasks</h4>
          <ul className="space-y-2">
              {airdrop.requirements.slice(0, 2).map((req, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary mt-1.5 shadow-[0_0_5px_rgba(139,92,246,0.8)]" />
                      {req}
                  </li>
              ))}
              {airdrop.requirements.length > 2 && (
                  <li className="text-xs text-slate-500 italic pl-3">
                      +{airdrop.requirements.length - 2} more tasks
                  </li>
              )}
          </ul>
        </div>

        <button className="w-full mt-6 bg-gradient-to-r from-surfaceLight to-surface border border-white/10 hover:border-primary/50 text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center group/btn relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
                View Strategy
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </span>
        </button>
      </div>
    </div>
  );
};