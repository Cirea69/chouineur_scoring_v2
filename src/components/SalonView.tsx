import { useState } from "react";
import { Users, Sparkles, Copy, Check, Radio, Wifi, Database, Laptop, Smartphone, Crown, Eye, User, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { Player } from "../types";
import { motion } from "motion/react";
import { PLAYER_COLORS, getPlayerColorPreset } from "../constants";
import AvatarPickerModal from "./AvatarPickerModal";

interface SalonViewProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  isGM: boolean;
  isSpectator: boolean;
  multiplayerMode: "local" | "simulated" | "multiplayer";
  onUpdateMultiplayerMode: (mode: "local" | "simulated" | "multiplayer") => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string, name: string) => void;
  onDisconnectRoom: () => void;
  roomCode: string | null;
  clientId: string;
  onStartGame: () => void;
}

export default function SalonView({
  players,
  onUpdatePlayers,
  isGM,
  isSpectator,
  multiplayerMode,
  onUpdateMultiplayerMode,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onDisconnectRoom,
  roomCode,
  clientId,
  onStartGame,
}: SalonViewProps) {
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Avatar Picker State for the Guest/Host profile editing inside Salon
  const [avatarPickerState, setAvatarPickerState] = useState<{
    isOpen: boolean;
    playerId: string | null;
  }>({
    isOpen: false,
    playerId: null,
  });

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPlayerEditable = (p: Player) => {
    if (isSpectator) return false;
    if (multiplayerMode === "local") return true;
    if (isGM) return true;
    return p.id === clientId;
  };

  const handleNameChange = (id: string, newName: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, name: newName } : p
    );
    onUpdatePlayers(updated);
  };

  const handleColorChange = (id: string, newColor: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, color: newColor } : p
    );
    onUpdatePlayers(updated);
  };

  const handleAvatarChange = (avatarUrl: string) => {
    if (avatarPickerState.playerId) {
      const updated = players.map((p) =>
        p.id === avatarPickerState.playerId ? { ...p, avatar: avatarUrl } : p
      );
      onUpdatePlayers(updated);
    }
  };

  const myPlayer = players.find((p) => p.id === clientId);
  const activeAvatar = myPlayer?.avatar || "";

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      {/* 🔮 Mode de jeu switcher */}
      <div className="mb-6 hand-drawn-border bg-surface-container-low dark:bg-stone-900/20 p-5 rounded-2xl shadow relative z-20">
        <h3 className="font-headline-sm text-xs sm:text-sm text-primary dark:text-primary-fixed-dim uppercase tracking-wider font-extrabold flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-secondary" />
          Mode de Connexion Actif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Local */}
          <button
            onClick={() => {
              if (multiplayerMode === "multiplayer" && roomCode) {
                if (confirm("Voulez-vous quitter le salon multijoueurs pour repasser en Pass-and-Play local ?")) {
                  onDisconnectRoom();
                  onUpdateMultiplayerMode("local");
                }
              } else {
                onUpdateMultiplayerMode("local");
              }
            }}
            className={`p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
              multiplayerMode === "local"
                ? "border-primary bg-primary/10 text-[#531302] dark:border-primary-fixed-dim dark:text-primary-fixed-dim dark:bg-primary/20"
                : "border-outline-variant hover:bg-black/5 dark:hover:bg-white/5 text-on-surface"
            }`}
          >
            <Laptop className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm">Pass-and-Play Local</p>
              <p className="text-[10px] text-on-surface-variant/90 leading-tight mt-0.5">Un seul appareil pour tout le monde.</p>
            </div>
          </button>

          {/* Simulateur */}
          <button
            onClick={() => {
              if (multiplayerMode === "multiplayer" && roomCode) {
                if (confirm("Voulez-vous quitter le salon multijoueurs pour repasser sur le simulateur ?")) {
                  onDisconnectRoom();
                  onUpdateMultiplayerMode("simulated");
                }
              } else {
                onUpdateMultiplayerMode("simulated");
              }
            }}
            className={`p-3 rounded-xl border-2 border-dashed text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
              multiplayerMode === "simulated"
                ? "border-primary bg-primary/10 text-[#531302] dark:border-primary-fixed-dim dark:text-primary-fixed-dim dark:bg-primary/20"
                : "border-outline-variant hover:bg-black/5 dark:hover:bg-white/5 text-on-surface"
            }`}
          >
            <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-black text-sm">Simulateur d'IA</p>
              <p className="text-[10px] text-on-surface-variant/90 leading-tight mt-0.5">S'entraîner avec des Chouineurs virtuels.</p>
            </div>
          </button>

          {/* Multijoueur */}
          <button
            onClick={() => onUpdateMultiplayerMode("multiplayer")}
            className={`p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
              multiplayerMode === "multiplayer"
                ? "border-secondary bg-secondary/10 text-[#04322b] dark:border-secondary dark:text-secondary-fixed-dim dark:bg-secondary/20"
                : "border-outline-variant hover:bg-black/5 dark:hover:bg-white/5 text-on-surface"
            }`}
          >
            <Wifi className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm">Multijoueur Réel</p>
              <p className="text-[10px] text-on-surface-variant/90 leading-tight mt-0.5">Jouer en direct avec plusieurs téléphones !</p>
            </div>
          </button>
        </div>
      </div>

      {/* 🌐 CONTENU DU SALON MULTIJOUEUR */}
      {multiplayerMode !== "multiplayer" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hand-drawn-border bg-surface dark:bg-zinc-900 p-8 rounded-2xl text-center space-y-4"
        >
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary-fixed-dim/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
            <Wifi className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="font-headline-md text-xl font-bold dark:text-white">Multijoueur en temps réel désactivé</h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Pour connecter d'autres smartphones ou tablettes, activer le salon ci-dessus et envoyez votre code à vos amis pour une partie de Chouine d'anthologie !
          </p>
          <button
            onClick={() => onUpdateMultiplayerMode("multiplayer")}
            className="py-2.5 px-6 bg-primary hover:opacity-95 text-on-primary font-bold text-xs rounded-xl border-b-2 border-black transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Activer le Mode Multijoueur
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Si pas encore de code de salon */}
          {!roomCode ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hand-drawn-border bg-surface dark:bg-zinc-900 p-6 rounded-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="font-headline-md text-lg sm:text-xl text-primary dark:text-primary-fixed-dim flex items-center justify-center gap-2">
                  <Radio className="w-6 h-6 text-secondary animate-pulse" />
                  Héberger ou Rejoindre un Salon
                </h2>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto italic leading-relaxed">
                  Connectez-vous à la base PocketBase partagée en créant un salon en tant que MJ, ou rejoignez-en un via son code à 4 lettres.
                </p>
              </div>

              {!showJoinForm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Créer un salon */}
                  <button
                    type="button"
                    onClick={onCreateOnlineRoom}
                    className="p-5 bg-primary hover:opacity-95 text-on-primary rounded-xl border-b-4 border-black transition-all cursor-pointer flex flex-col items-center text-center gap-2 group hover:translate-y-[-2px]"
                  >
                    <Crown className="w-8 h-8 text-[#ffd700] group-hover:scale-110 duration-200" />
                    <span className="font-black text-sm uppercase tracking-wider">Héberger un Salon (MJ)</span>
                    <span className="text-[10px] opacity-90 leading-tight">Vous serez le Maître du Jeu et gérerez le score et la validation.</span>
                  </button>

                  {/* Rejoindre un salon */}
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(true)}
                    className="p-5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl border-b-4 border-outline transition-all cursor-pointer flex flex-col items-center text-center gap-2 group hover:translate-y-[-2px]"
                  >
                    <Users className="w-8 h-8 text-secondary group-hover:scale-110 duration-200" />
                    <span className="font-black text-sm uppercase tracking-wider">Rejoindre un Salon</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">Utilisez le code à 4 lettres généré par l'hôte.</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 bg-surface-container-low dark:bg-stone-900/30 p-5 rounded-xl border-2 border-outline-variant"
                >
                  <h3 className="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Rejoindre une partie en direct
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant block uppercase mb-1">Code du Salon</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="EX: XYZT"
                        className="w-full bg-surface-container border-2 border-outline rounded-lg p-2.5 text-center font-mono font-black uppercase tracking-widest text-lg focus:outline-none focus:border-primary text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant block uppercase mb-1">Votre Pseudo</label>
                      <input
                        type="text"
                        maxLength={14}
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="Gaston"
                        className="w-full bg-surface-container border-2 border-outline rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="py-2.5 text-xs font-bold rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      disabled={!joinCode.trim() || !joinName.trim()}
                      onClick={() => {
                        if (joinCode && joinName) {
                          onJoinOnlineRoom(joinCode, joinName);
                        }
                      }}
                      className="py-2.5 text-xs font-bold rounded-lg bg-primary text-on-primary hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Confirmer & Se Connecter
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Salon Connecté / Actif */
            <div className="space-y-6">
              {/* Grande carte du code de salon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hand-drawn-border bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="corner-flourish flourish-tr"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span>SALON ACTIF EN DIRECT</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-primary dark:text-primary-fixed-dim tracking-widest uppercase select-all">
                        {roomCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-primary dark:text-primary-fixed-dim rounded-lg transition-all active:scale-90 cursor-pointer"
                        title="Copier le code"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-on-surface-variant">L'autre joueur peut rejoindre avec ce code à 4 lettres !</p>
                  </div>

                  <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase block">VOTRE RÔLE</span>
                    <span className="text-sm font-black text-secondary dark:text-secondary-fixed-dim uppercase flex items-center gap-1 mt-0.5">
                      {isGM ? (
                        <>
                          <Crown className="w-4 h-4 text-[#ffd700]" />
                          MJ (Hébergeur)
                        </>
                      ) : isSpectator ? (
                        <>
                          <Eye className="w-4 h-4 text-amber-500" />
                          Spectateur / Observateur
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-blue-500" />
                          Joueur Distant
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {isSpectator && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-300 text-[11px] p-3 rounded-lg leading-relaxed font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Vous regardez cette partie en tant que <strong>Spectateur Seul</strong>. Soit la partie est déjà commencée, soit le salon de 5 joueurs est complet. Vous pouvez voir les scores en direct !
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Roster de joueurs connectés */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-xs sm:text-sm text-on-surface uppercase tracking-wider font-extrabold flex items-center gap-2 px-1">
                  <Users className="w-4 h-4 text-secondary" />
                  Membres et Chouineurs dans le Salon ({players.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {players.map((player, index) => {
                    const isSelf = player.id === clientId;
                    const colorPreset = getPlayerColorPreset(player.color, index);
                    const editable = isPlayerEditable(player);

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between gap-3 bg-surface-container-low dark:bg-stone-900/30 ${
                          isSelf ? "border-primary dark:border-primary-fixed-dim" : "border-outline-variant"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Photo / Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-300 dark:border-zinc-700 bg-surface flex items-center justify-center">
                              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            
                            {editable && (
                              <button
                                onClick={() => setAvatarPickerState({ isOpen: true, playerId: player.id })}
                                className="absolute -bottom-1 -right-1 bg-secondary text-white p-1 rounded-full cursor-pointer hover:scale-110 duration-100 border border-white dark:border-zinc-900 flex items-center justify-center"
                                title="Modifier la photo"
                              >
                                <Users className="w-2.5 h-2.5 text-white" />
                              </button>
                            )}
                          </div>

                          {/* Profil Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              {index === 0 ? (
                                <Crown className="w-3.5 h-3.5 text-[#ffd700]" title="Hôte de la partie" />
                              ) : null}
                              {isSelf ? (
                                <span className="text-xs bg-primary/10 text-primary dark:bg-primary-fixed-dim/20 dark:text-primary-fixed-dim px-1.5 py-0.2 rounded font-black text-[9px] uppercase tracking-wider">
                                  VOUS
                                </span>
                              ) : null}
                            </div>

                            {/* Pseudo input or static name list */}
                            {isSelf ? (
                              <input
                                type="text"
                                maxLength={14}
                                value={player.name}
                                onChange={(e) => handleNameChange(player.id, e.target.value)}
                                className="font-bold text-sm bg-transparent border-b border-dashed border-outline-variant py-0 px-0 focus:outline-none focus:border-primary w-28 text-on-surface"
                                placeholder="..."
                              />
                            ) : (
                              <p className="font-bold text-sm truncate text-on-surface">{player.name}</p>
                            )}

                            <p className="text-[10px] text-on-surface-variant truncate italic font-medium leading-normal mt-0.5">
                              {index === 0 ? "Maître du Jeu" : "Chouineur de réserve"}
                            </p>
                          </div>
                        </div>

                        {/* Custom Color Selector for Self */}
                        {isSelf && (
                          <div className="flex gap-1 shrink-0">
                            {PLAYER_COLORS.slice(0, 4).map((col) => {
                              const isSelected = player.color === col.id || (!player.color && getPlayerColorPreset(undefined, index).id === col.id);
                              
                              return (
                                <button
                                  key={col.id}
                                  type="button"
                                  onClick={() => handleColorChange(player.id, col.id)}
                                  className={`w-4 h-4 rounded-full border border-stone-400 cursor-pointer ${col.bgClass} ${
                                    isSelected ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                                  }`}
                                  title={col.name}
                                />
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-outline-variant/50 space-y-3">
                {isGM ? (
                  <button
                    onClick={onStartGame}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 hover:shadow-lg text-white font-black text-sm rounded-xl border-b-4 border-black transition-all flex items-center justify-center gap-2 active:translate-y-[2px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    LANCER LE SACRE ROYAL !
                  </button>
                ) : (
                  <div className="hand-drawn-border bg-blue-100/10 dark:bg-blue-950/20 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                    <span className="w-6 h-6 border-4 border-primary border-t-transparent animate-spin rounded-full"></span>
                    <p className="font-extrabold text-xs text-primary dark:text-primary-fixed-dim uppercase tracking-wider">
                      En attente du Maître du Jeu
                    </p>
                    <p className="text-[10px] text-on-surface-variant max-w-sm italic">
                      Dès que Gaston (le MJ) aura validé la formation et cliqué sur "Lancer", le tableau de score apparaîtra sur votre écran en direct !
                    </p>
                  </div>
                )}

                <button
                  onClick={onDisconnectRoom}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl border-b-2 border-black transition-all cursor-pointer"
                >
                  Quitter le Salon et fermer le lobby en direct
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera / Photo avatar picker Modal integration */}
      <AvatarPickerModal
        isOpen={avatarPickerState.isOpen}
        onClose={() => setAvatarPickerState({ isOpen: false, playerId: null })}
        onSelectAvatar={handleAvatarChange}
        currentAvatar={activeAvatar}
      />
    </div>
  );
}
