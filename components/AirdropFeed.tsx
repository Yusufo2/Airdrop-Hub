import React from 'react';
import { Airdrop } from '../types';
import { AirdropCard } from './AirdropCard';
import { FireIcon, SparklesIcon } from '@heroicons/react/24/solid';

const MOCK_AIRDROPS: Airdrop[] = [
  {
    id: '1',
    name: 'Nebula Protocol',
    value: '~$500 - $2000',
    status: 'Active',
    description: 'Nebula is a Layer 2 scaling solution using ZK-rollups. They have confirmed a token airdrop for early users who bridge assets and interact with their testnet dApps.',
    tags: ['Layer 2', 'Testnet', 'High Value'],
    requirements: ['Bridge ETH to Nebula', 'Complete 5 transactions', 'Join Discord'],
  },
  {
    id: '2',
    name: 'Ocean Dex',
    value: '~$150',
    status: 'Upcoming',
    description: 'A new decentralized exchange aggregator on Solana. Early liquidity providers and beta testers are eligible for the $OCEAN governance token distribution.',
    tags: ['DeFi', 'Solana', 'Liquidity'],
    requirements: ['Provide >$100 Liquidity', 'Swap 3 times'],
  },
  {
    id: '3',
    name: 'StarkGaming',
    value: 'Unknown',
    status: 'Active',
    description: 'Play-to-earn ecosystem built on StarkNet. Mint your free "Origin" badge NFT to qualify for future drops. Backed by major VC firms.',
    tags: ['GameFi', 'NFT', 'StarkNet'],
    requirements: ['Connect Wallet', 'Mint Free NFT'],
  },
  {
    id: '4',
    name: 'ZetaChain',
    value: '~$300',
    status: 'Active',
    description: 'Omnichain smart contracts. Earn ZETA points by swapping assets across chains on their testnet. Points will convert to tokens at TGE.',
    tags: ['Omnichain', 'Points System'],
    requirements: ['Daily Cross-chain Swap', 'Invite Friends'],
  },
];

export const AirdropFeed: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="relative pt-12 pb-10 px-6 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 animate-float">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-slate-300">New Opportunities Added Daily</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-4 tracking-tight drop-shadow-sm">
                Hunt the Next <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">Big Airdrop</span>
            </h2>
            
            <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Discover verified crypto airdrops, track your eligibility, and maximize your earnings with AI-powered insights.
            </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
                <FireIcon className="w-5 h-5 text-orange-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Trending Now</h3>
                <p className="text-slate-400 text-xs">High potential value opportunities</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {MOCK_AIRDROPS.map(drop => (
            <AirdropCard key={drop.id} airdrop={drop} />
          ))}
        </div>
      </div>
    </div>
  );
};