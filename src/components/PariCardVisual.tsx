import { PariCard } from "../constants";

interface PariCardVisualProps {
  card: PariCard;
  isSelected?: boolean;
  isDiscarded?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  playerIndex?: number;
}

const PLAYER_CARD_THEMES = [
  // Gaston: Gold / Amber
  { drape: "bg-amber-600 text-amber-700" },
  // Simone: Royal Indigo Blue
  { drape: "bg-blue-600 text-blue-700" },
  // Balthazar: Emerald Green
  { drape: "bg-emerald-600 text-emerald-700" },
  // Player 4: Amethyst/Purple
  { drape: "bg-purple-600 text-purple-700" },
  // Player 5: Terracotta Red
  { drape: "bg-rose-600 text-rose-700" }
];

export default function PariCardVisual({
  card,
  isSelected = false,
  isDiscarded = false,
  size = "md",
  onClick,
  playerIndex,
}: PariCardVisualProps) {
  // Dimension mappings
  const widthClass = size === "sm" ? "w-24 h-44" : size === "lg" ? "w-48 h-84" : "w-32 h-56";
  const scaleEffect = isSelected ? "scale-[1.04] shadow-xl border-dashed border-primary" : "hover:scale-[1.02] shadow hover:shadow-md border-transparent";
  const disabledEffect = isDiscarded ? "opacity-35 grayscale cursor-not-allowed" : "cursor-pointer";

  // Colors for specific arches and elements if no playerIndex is defined
  const drapeStyles: { [key: string]: string } = {
    orange: "bg-orange-500 text-orange-600",
    verte: "bg-emerald-600 text-emerald-700",
    bleu: "bg-blue-600 text-blue-700",
    rouge: "bg-red-600 text-red-700",
    violet: "bg-purple-600 text-purple-700",
  };

  const chosenTheme = playerIndex !== undefined ? PLAYER_CARD_THEMES[playerIndex % PLAYER_CARD_THEMES.length] : null;
  const drapeClass = chosenTheme ? chosenTheme.drape : (drapeStyles[card.id] || "bg-stone-500 text-stone-600");

  // Render internal miniature stained glass arched window architecture
  const renderArches = () => {
    switch (card.id) {
      case "violet": // 3 plis -> 5 pts | 4+ plis -> 10 pts
        return (
          <div className="absolute inset-0 flex flex-col justify-end p-2 pb-3">
            {/* Top Windows with stained glass score badges */}
            <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 z-10">
              {/* Badge 5 (plis 3) */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full border border-stone-800 dark:border-stone-400 bg-amber-100 flex items-center justify-center text-[10px] font-black text-purple-800 shadow" style={{ backgroundImage: "linear-gradient(45deg, #fef08a, #c084fc)" }}>
                  5
                </div>
              </div>
              {/* Badge 10 (plis 4+) */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-1.5 border-stone-800 dark:border-stone-400 bg-amber-200 flex items-center justify-center text-xs font-black text-purple-900 shadow-md" style={{ backgroundImage: "linear-gradient(135deg, #ec4899, #f59e0b, #a855f7)" }}>
                  10
                </div>
              </div>
            </div>

            {/* Twin Arches */}
            <div className="grid grid-cols-2 gap-2 h-[65%] items-end relative">
              {/* Left Arch (3) */}
              <div className="h-full border-t-2 border-x-2 border-purple-900/25 dark:border-purple-300/20 rounded-t-full flex flex-col justify-end items-center pb-2 bg-stone-100/50 dark:bg-stone-900/40 relative">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-none">3</span>
                <span className="text-[7px] font-bold text-stone-500 uppercase tracking-tighter leading-none">plis</span>
              </div>
              {/* Right Arch (4+) */}
              <div className="h-full border-t-2 border-x-2 border-purple-900/25 dark:border-purple-300/20 rounded-t-full flex flex-col justify-end items-center pb-2 bg-stone-100/50 dark:bg-stone-900/40 relative">
                <span className="text-2xl font-black text-purple-700 dark:text-purple-300 leading-none">4+</span>
                <span className="text-[7px] font-bold text-stone-500 uppercase tracking-tighter leading-none">plis</span>
              </div>
            </div>
          </div>
        );

      case "orange": // 0 plis -> 8 pts | 1 pli -> 3 pts
        return (
          <div className="absolute inset-0 flex flex-col justify-end p-2 pb-3">
            {/* Stained circles badges */}
            <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 z-10">
              {/* Badge 8 (plis 0) */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-1.5 border-stone-800 dark:border-stone-400 bg-orange-100 flex items-center justify-center text-xs font-black text-orange-900 shadow" style={{ backgroundImage: "linear-gradient(45deg, #fbbf24, #10b981)" }}>
                  8
                </div>
              </div>
              {/* Badge 3 (plis 1) */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full border border-stone-800 dark:border-stone-400 bg-orange-50 flex items-center justify-center text-[10px] font-black text-white shadow" style={{ backgroundImage: "linear-gradient(135deg, #fb923c, #ec4899)" }}>
                  3
                </div>
              </div>
            </div>

            {/* Twin Arches */}
            <div className="grid grid-cols-2 gap-2 h-[65%] items-end">
              {/* Left Arch (0) */}
              <div className="h-full border-t-2 border-x-2 border-orange-950/20 dark:border-orange-300/10 rounded-t-full flex flex-col justify-end items-center pb-2 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-3xl font-black text-orange-500 dark:text-orange-400 leading-none">0</span>
                <span className="text-[7px] font-bold text-stone-500 uppercase tracking-tighter leading-none">plis</span>
              </div>
              {/* Right Arch (1) */}
              <div className="h-full border-t-2 border-x-2 border-orange-950/20 dark:border-orange-300/10 rounded-t-full flex flex-col justify-end items-center pb-2 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-2xl font-black text-orange-600 dark:text-orange-300 leading-none">1</span>
                <span className="text-[7px] font-bold text-stone-500 uppercase tracking-tighter leading-none">pli</span>
              </div>
            </div>
          </div>
        );

      case "rouge": // 1 pli -> 4 pts | 2 plis -> 8 pts | 3 plis -> 4 pts
        return (
          <div className="absolute inset-0 flex flex-col justify-end p-2 pb-3">
            {/* Top Row Score Circles */}
            <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1 z-10 scale-95">
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-red-100 flex items-center justify-center text-[9px] font-black text-red-800" style={{ backgroundImage: "linear-gradient(45deg, #fecaca, #f59e0b)" }}>4</div>
              <div className="w-5 h-5 rounded-full border border-stone-800 bg-red-200 flex items-center justify-center text-[10px] font-black text-red-900 shadow" style={{ backgroundImage: "linear-gradient(135deg, #ef4444, #3b82f6)" }}>8</div>
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-red-100 flex items-center justify-center text-[9px] font-black text-red-800" style={{ backgroundImage: "linear-gradient(45deg, #fecaca, #10b981)" }}>4</div>
            </div>

            {/* Three Arches */}
            <div className="grid grid-cols-3 gap-0.5 h-[65%] items-end">
              {/* Left Arch (1) */}
              <div className="h-full border-t border-x border-red-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-red-500 dark:text-red-400 leading-none">1</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">pli</span>
              </div>
              {/* Mid Arch (2) */}
              <div className="h-full border-t border-x border-red-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40 scale-[1.08] relative z-10">
                <span className="text-xl font-black text-red-655 dark:text-red-400 leading-none">2</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
              {/* Right Arch (3) */}
              <div className="h-full border-t border-x border-red-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-red-500 dark:text-red-400 leading-none">3</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
            </div>
          </div>
        );

      case "verte": // 0 pli -> 2 pt | 1 pli -> 8 pts | 2 plis -> 5 pts
        return (
          <div className="absolute inset-0 flex flex-col justify-end p-2 pb-3">
            {/* Score Circles */}
            <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1 z-10 scale-95">
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-800" style={{ backgroundImage: "linear-gradient(45deg, #a7f3d0, #f59e0b)" }}>2</div>
              <div className="w-5 h-5 rounded-full border border-stone-800 bg-emerald-200 flex items-center justify-center text-[10px] font-black text-emerald-900 shadow" style={{ backgroundImage: "linear-gradient(135deg, #10b981, #6366f1)" }}>8</div>
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-800" style={{ backgroundImage: "linear-gradient(225deg, #a7f3d0, #ec4899)" }}>5</div>
            </div>

            {/* Three Arches */}
            <div className="grid grid-cols-3 gap-0.5 h-[65%] items-end">
              {/* Left Arch (0) */}
              <div className="h-full border-t border-x border-emerald-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 leading-none">0</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">pli</span>
              </div>
              {/* Mid Arch (1) */}
              <div className="h-full border-t border-x border-emerald-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40 scale-[1.08] relative z-10">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">1</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">pli</span>
              </div>
              {/* Right Arch (2) */}
              <div className="h-full border-t border-x border-emerald-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 leading-none">2</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
            </div>
          </div>
        );

      case "bleu": // 2 plis -> 3 pts | 3 plis -> 9 pts | 4 plis -> 4 pts
      default:
        return (
          <div className="absolute inset-0 flex flex-col justify-end p-2 pb-3">
            {/* Score Circles */}
            <div className="absolute top-[34%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1 z-10 scale-95">
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-cyan-100 flex items-center justify-center text-[9px] font-black text-cyan-800" style={{ backgroundImage: "linear-gradient(45deg, #cffafe, #10b981)" }}>3</div>
              <div className="w-5 h-5 rounded-full border border-stone-800 bg-cyan-200 flex items-center justify-center text-[10px] font-black text-cyan-900 shadow" style={{ backgroundImage: "linear-gradient(135deg, #06b6d4, #f43f5e)" }}>9</div>
              <div className="w-4 h-4 rounded-full border border-stone-800 bg-cyan-100 flex items-center justify-center text-[9px] font-black text-cyan-800" style={{ backgroundImage: "linear-gradient(225deg, #cffafe, #8b5cf6)" }}>4</div>
            </div>

            {/* Three Arches */}
            <div className="grid grid-cols-3 gap-0.5 h-[65%] items-end">
              {/* Left Arch (2) */}
              <div className="h-full border-t border-x border-cyan-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-cyan-500 dark:text-cyan-400 leading-none">2</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
              {/* Mid Arch (3) */}
              <div className="h-full border-t border-x border-cyan-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40 scale-[1.08] relative z-10">
                <span className="text-xl font-black text-cyan-600 dark:text-cyan-300 leading-none">3</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
              {/* Right Arch (4) */}
              <div className="h-full border-t border-x border-cyan-950/20 rounded-t-full flex flex-col justify-end items-center pb-1.5 bg-stone-100/50 dark:bg-stone-900/40">
                <span className="text-lg font-black text-cyan-500 dark:text-cyan-400 leading-none">4</span>
                <span className="text-[6px] font-bold text-stone-500 uppercase leading-none mt-0.5">plis</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={isDiscarded ? undefined : onClick}
      className={`relative select-none rounded-xl border-2 overflow-hidden transition-all duration-300 bg-stone-50 dark:bg-stone-950 ${widthClass} ${scaleEffect} ${disabledEffect} flex flex-col p-1.5`}
      style={{
        boxShadow: isSelected
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 3px var(--color-primary)"
          : "0 4px 10px -3px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Background Subtle Stained Glass Backdrop Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />

      {/* Outside Golden Card border (very elegant) */}
      <div className="absolute inset-1 rounded-lg border-1 border-stone-300/60 dark:border-stone-800 pointer-events-none" />

      {/* Hanging Curtain / Marquise Header representing the draped curtains */}
      <div className={`h-[28%] w-full rounded-t-md relative flex items-center justify-center overflow-hidden shrink-0 ${drapeClass}`}>
        {/* Curtains fold layers styling */}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-black/20" />
        <div className="absolute -left-3 top-[-10px] w-12 h-16 rounded-full bg-black/15 flex items-center justify-center transform rotate-12" />
        <div className="absolute -right-3 top-[-10px] w-12 h-16 rounded-full bg-black/15 flex items-center justify-center transform -rotate-12" />

        {/* Card Suit / Color Identifier */}
        <span className="font-headline-sm uppercase text-[9px] tracking-widest text-white/90 drop-shadow font-black z-10 px-2 py-0.5 bg-black/20 rounded-md">
          {card.colorName}
        </span>
      </div>

      {/* Windows, arches, and score indicators nested panel */}
      <div className="relative flex-grow rounded-b-md border border-stone-200 dark:border-stone-850 mt-1 bg-[#faf7f2] dark:bg-[#151310] overflow-hidden">
        {renderArches()}
      </div>

      {/* Discarded cross mark overlay */}
      {isDiscarded && (
        <div className="absolute inset-0 bg-stone-900/75 flex flex-col items-center justify-center text-white z-20">
          <span className="text_shadow font-black text-sm uppercase tracking-widest rotate-[-15deg] px-2.5 py-1 border-2 border-white rounded-md">
            Éliminée
          </span>
          <span className="text-[9px] font-medium text-stone-300 mt-1">Déjà validée !</span>
        </div>
      )}
    </div>
  );
}
