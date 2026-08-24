import { useState } from "react";
import { X, Sliders, Smartphone, Users, HelpCircle, RefreshCw, Sparkles, Check, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maxRounds: number;
  onUpdateMaxRounds: (rounds: number) => void;
  multiplayerMode: "local" | "simulated";
  onUpdateMultiplayerMode: (mode: "local" | "simulated") => void;
  onResetAll: () => void;
  onSimulateLobbyPlayers: () => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  maxRounds,
  onUpdateMaxRounds,
  multiplayerMode,
  onUpdateMultiplayerMode,
  onResetAll,
  onSimulateLobbyPlayers,
}: SettingsDialogProps) {
  const [lobbyCode, setLobbyCode] = useState(() => "CHOUINE-" + Math.floor(100 + Math.random() * 900));
  const [copiedLobby, setCopiedLobby] = useState(false);
  const [activeTab, setActiveTab] = useState<"game" | "multiplayer">("game");

  const [simulatedEvents, setSimulatedEvents] = useState<string[]>([
    "Salon créé avec succès.",
    "Vous êtes désigné Maître du Donjon."
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    setCopiedLobby(true);
    setTimeout(() => setCopiedLobby(false), 2000);
  };

  const triggerSimulateEvent = () => {
    const eventsList = [
      "Gaston a rejoint la partie avec un air suspicieux.",
      "Simone a contesté la règle n°4 concernant les atouts.",
      "Balthazar menace de quitter si ses lancers ne s'améliorent pas.",
      "Dédé demande si on peut jouer à l'envers.",
      "Vieux Grognon a poussé un soupir théâtral.",
      "Reine Decker a ordonné le silence royal dans le chat."
    ];
    const randomEvent = eventsList[Math.floor(Math.random() * eventsList.length)];
    setSimulatedEvents(prev => [randomEvent, ...prev.slice(0, 4)]);
    onSimulateLobbyPlayers();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background dark:bg-surface-dim w-full max-w-md hand-drawn-border p-6 rounded-xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed-dim flex items-center gap-2">
              <Sliders className="w-6 h-6 text-secondary" />
              Options Chouineuses
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer text-on-surface"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick tab */}
          <div className="flex border-b-2 border-outline-variant/60 mb-6 font-label-md text-sm">
            <button
              onClick={() => setActiveTab("game")}
              className={`flex-1 pb-2.5 text-center cursor-pointer transition-all ${
                activeTab === "game"
                  ? "border-b-4 border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Paramètres Jeu
            </button>
            <button
              onClick={() => setActiveTab("multiplayer")}
              className={`flex-1 pb-2.5 text-center cursor-pointer transition-all ${
                activeTab === "multiplayer"
                  ? "border-b-4 border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Mode Multijoueur
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === "game" && (
              <>
                {/* 1. Nombre de manches maximum */}
                <div className="space-y-2">
                  <label className="font-label-lg text-sm text-on-surface-variant font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-tertiary" />
                    Nombre de Manches (Tours)
                  </label>
                  <div className="relative">
                    <div className="py-3 px-4 bg-tertiary-container/30 dark:bg-tertiary-container/10 border-2 border-dashed border-tertiary text-on-tertiary-container dark:text-on-surface rounded-lg font-headline-sm text-sm text-center flex items-center justify-center gap-2">
                      <span className="font-black text-base text-tertiary">4 Manches</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-tertiary text-on-tertiary rounded-full select-none">Règle Officielle 🔒</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/80 italic mt-1.5 text-center px-1">
                      Conformément aux règles authentiques de la Chouine, une partie se dispute strictement sur 4 manches.
                    </p>
                  </div>
                </div>

                {/* Reset all button */}
                <div className="pt-4 border-t border-outline-variant/60">
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (confirm("Voulez-vous vraiment réinitialiser toutes les saisies et effacer le roster ?")) {
                          onResetAll();
                          onClose();
                        }
                      }}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-label-lg rounded-lg border-b-4 border-black transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Remettre à Zéro le Jeu
                    </button>
                    <p className="text-[10px] text-on-surface-variant/70 text-center italic">
                      Supprime les scores enregistrés, réinitialise la manche à 1 et restaure l'équipe de base.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "multiplayer" && (
              <>
                {/* Multiplayer Mode selector */}
                <div className="space-y-3">
                  <label className="font-label-lg text-sm text-on-surface-variant font-bold">
                    Choisir votre Mode de Réseau
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Local hot-seat */}
                    <button
                      onClick={() => onUpdateMultiplayerMode("local")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                        multiplayerMode === "local"
                          ? "bg-primary/5 border-primary text-primary dark:text-primary-fixed-dim"
                          : "border-outline-variant hover:border-primary text-on-surface"
                      }`}
                    >
                      <Smartphone className="w-7 h-7 text-secondary" />
                      <div className="text-xs">
                        <p className="font-black">Pass-and-Play</p>
                        <p className="text-[9px] text-on-surface-variant italic leading-tight mt-0.5">Sur le même appareil</p>
                      </div>
                    </button>

                    {/* Online Simulated mode */}
                    <button
                      onClick={() => onUpdateMultiplayerMode("simulated")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                        multiplayerMode === "simulated"
                          ? "bg-primary/5 border-primary text-primary dark:text-primary-fixed-dim"
                          : "border-outline-variant hover:border-primary text-on-surface"
                      }`}
                    >
                      <Users className="w-7 h-7 text-tertiary" />
                      <div className="text-xs">
                        <p className="font-black">Salon en ligne</p>
                        <p className="text-[9px] text-on-surface-variant italic leading-tight mt-0.5">Lobby virtuel simulé</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Simulated lobby controller if active */}
                {multiplayerMode === "simulated" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-surface-container rounded-lg border border-outline-variant space-y-4"
                  >
                    <div>
                      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                        Votre Code du Salon
                      </span>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={lobbyCode}
                          className="flex-grow bg-surface-container-low border-b-2 border-outline text-center font-mono text-sm uppercase tracking-widest font-black py-1.5 focus:outline-none"
                        />
                        <button
                          onClick={handleCopyCode}
                          className="px-3 bg-primary text-on-primary hover:opacity-90 font-label-md text-xs cursor-pointer flex items-center justify-center rounded"
                        >
                          {copiedLobby ? <Check className="w-4 h-4" /> : "Copier"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-outline-variant">
                      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                        Événements du Lobby en direct
                      </span>
                      <div className="bg-black/10 p-2.5 rounded text-[10px] font-mono text-green-400 dark:text-green-300 min-h-24 max-h-28 overflow-y-auto space-y-1">
                        {simulatedEvents.map((ev, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="text-outline">&gt;</span>
                            <span className="truncate">{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={triggerSimulateEvent}
                      className="w-full py-2.5 bg-secondary text-on-secondary hover:bg-secondary-container transition-all active:scale-95 font-label-lg font-bold text-xs rounded border-b-2 border-black flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 animate-spin-slow" />
                      Simuler un autre Chouineur en ligne !
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
