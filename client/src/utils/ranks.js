export const RANKS = [
  {
    title: 'Junior Sleuth',
    minScore: 0,
    badgeColor: 'text-stone-400 border-stone-600 bg-stone-900/60',
    description: 'A rookie detective learning to look beneath the obvious.',
  },
  {
    title: 'Private Eye',
    minScore: 80,
    badgeColor: 'text-amber-400 border-amber-600/60 bg-amber-950/40',
    description: 'A seasoned investigator with an eye for deceptive alibis.',
  },
  {
    title: 'Senior Detective',
    minScore: 130,
    badgeColor: 'text-cyan-400 border-cyan-600/60 bg-cyan-950/40',
    description: 'A decorated lead investigator capable of solving high-stakes conspiracies.',
  },
  {
    title: 'Master Detective',
    minScore: 180,
    badgeColor: 'text-rose-400 border-rose-600/60 bg-rose-950/40',
    description: 'A legendary master of deduction on par with Hercule Poirot & Sherlock Holmes.',
  },
];

export function calculateDetectiveRank(score) {
  if (score >= 180) return RANKS[3];
  if (score >= 130) return RANKS[2];
  if (score >= 80) return RANKS[1];
  return RANKS[0];
}
