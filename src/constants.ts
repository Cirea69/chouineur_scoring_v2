/**
 * Cartes Pari officielles de Chouineurs
 */

export interface PlayerColorPreset {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  ringClass: string;
  accentBg: string;
  hex: string;
}

export const PLAYER_COLORS: PlayerColorPreset[] = [
  { id: "amber", name: "Orange / Jaune", bgClass: "bg-amber-500", borderClass: "border-amber-500", textClass: "text-amber-900 dark:text-amber-300 font-extrabold", badgeClass: "bg-amber-600/15 text-amber-950 dark:text-amber-200 border border-amber-500/30 font-bold", ringClass: "focus:ring-amber-500", accentBg: "bg-amber-500/10 dark:bg-amber-500/15", hex: "#f59e0b" },
  { id: "blue", name: "Bleu", bgClass: "bg-blue-600", borderClass: "border-blue-600", textClass: "text-blue-800 dark:text-blue-300 font-extrabold", badgeClass: "bg-blue-600/15 text-blue-950 dark:text-blue-200 border border-blue-500/30 font-bold", ringClass: "focus:ring-blue-500", accentBg: "bg-blue-500/10 dark:bg-blue-500/15", hex: "#2563eb" },
  { id: "emerald", name: "Vert", bgClass: "bg-emerald-600", borderClass: "border-emerald-600", textClass: "text-emerald-800 dark:text-emerald-300 font-extrabold", badgeClass: "bg-emerald-600/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30 font-bold", ringClass: "focus:ring-emerald-500", accentBg: "bg-emerald-500/10 dark:bg-emerald-500/15", hex: "#16a34a" },
  { id: "rose", name: "Rose", bgClass: "bg-rose-600", borderClass: "border-rose-600", textClass: "text-rose-800 dark:text-rose-300 font-extrabold", badgeClass: "bg-rose-600/15 text-rose-950 dark:text-rose-200 border border-rose-500/30 font-bold", ringClass: "focus:ring-rose-500", accentBg: "bg-rose-500/10 dark:bg-rose-500/15", hex: "#e11d48" },
  { id: "purple", name: "Violet", bgClass: "bg-purple-600", borderClass: "border-purple-600", textClass: "text-purple-800 dark:text-purple-300 font-extrabold", badgeClass: "bg-purple-600/15 text-purple-950 dark:text-purple-200 border border-purple-500/30 font-bold", ringClass: "focus:ring-purple-500", accentBg: "bg-purple-500/10 dark:bg-purple-500/15", hex: "#9333ea" },
];

export function getPlayerColorPreset(colorId?: string, fallbackIndex: number = 0): PlayerColorPreset {
  const found = PLAYER_COLORS.find(c => c.id === colorId);
  return found || PLAYER_COLORS[fallbackIndex % PLAYER_COLORS.length];
}

export interface PariCard {
  id: string;
  name: string;
  colorName: string;
  color: string; // CSS bg gradient classes
  textColor: string; // CSS text classes
  bgColor: string; // CSS block bg
  borderColor: string; // CSS border
  accentColor: string; // CSS light accent
  bets: {
    plis: number;
    label: string;
    points: number;
  }[];
}

export const PARI_CARDS: PariCard[] = [
  {
    id: "orange",
    name: "0-1",
    colorName: "Pari 0-1",
    color: "from-amber-400 via-orange-400 to-orange-500",
    textColor: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    borderColor: "border-orange-500/30",
    accentColor: "bg-orange-500 text-white",
    bets: [
      { plis: 0, label: "0 pli", points: 8 },
      { plis: 1, label: "1 pli", points: 3 }
    ]
  },
  {
    id: "verte",
    name: "0-1-2",
    colorName: "Pari 0-1-2",
    color: "from-emerald-400 via-green-400 to-green-600",
    textColor: "text-emerald-700 dark:text-emerald-350",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    accentColor: "bg-emerald-600 text-white",
    bets: [
      { plis: 0, label: "0 pli", points: 2 },
      { plis: 1, label: "1 pli", points: 8 },
      { plis: 2, label: "2 plis", points: 5 }
    ]
  },
  {
    id: "bleu",
    name: "2-3-4",
    colorName: "Pari 2-3-4",
    color: "from-cyan-500 via-blue-400 to-blue-600",
    textColor: "text-blue-700 dark:text-blue-350",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    accentColor: "bg-blue-600 text-white",
    bets: [
      { plis: 2, label: "2 plis", points: 3 },
      { plis: 3, label: "3 plis", points: 9 },
      { plis: 4, label: "4 plis", points: 4 }
    ]
  },
  {
    id: "rouge",
    name: "1-2-3",
    colorName: "Pari 1-2-3",
    color: "from-red-500 via-rose-400 to-rose-600",
    textColor: "text-red-700 dark:text-red-350",
    bgColor: "bg-red-500/10 dark:bg-red-500/20",
    borderColor: "border-red-500/30",
    accentColor: "bg-red-600 text-white",
    bets: [
      { plis: 1, label: "1 pli", points: 4 },
      { plis: 2, label: "2 plis", points: 8 },
      { plis: 3, label: "3 plis", points: 4 }
    ]
  },
  {
    id: "violet",
    name: "3-4+",
    colorName: "Pari 3-4+",
    color: "from-purple-500 via-indigo-500 to-indigo-600",
    textColor: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    accentColor: "bg-purple-600 text-white",
    bets: [
      { plis: 3, label: "3 plis", points: 5 },
      { plis: 4, label: "4+ plis", points: 10 }
    ]
  }
];

export const checkPariMatch = (cardId: string, plisCount: number) => {
  const card = PARI_CARDS.find(c => c.id === cardId);
  if (!card) return null;
  const matchedBet = card.bets.find(b => {
    if (b.label.includes("+")) {
      return plisCount >= b.plis;
    }
    return b.plis === plisCount;
  });
  return matchedBet || null;
};
