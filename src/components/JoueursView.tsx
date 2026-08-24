import { useState } from "react";
import { Plus, Trash2, Camera, Star, Sparkles, Smile, MessageSquare, AlertCircle, Users, Play, BookmarkPlus, UserCheck, Check, Save } from "lucide-react";
import { Player, SavedProfile } from "../types";
import AvatarPickerModal from "./AvatarPickerModal";
import { motion, AnimatePresence } from "motion/react";
import { PLAYER_COLORS, getPlayerColorPreset } from "../constants";

interface JoueursViewProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onStartGame: () => void;
  isGM?: boolean;
  isSpectator?: boolean;
  multiplayerMode?: string;
  onCreateOnlineRoom?: () => void;
  onJoinOnlineRoom?: (code: string, name: string) => void;
  onDisconnectRoom?: () => void;
  roomCode?: string | null;
  clientId?: string;
}

const DEFAULT_SUBTITLES = [
  "Prêt à chouiner pour la victoire.",
  "A toujours une carte dans sa manche.",
  "Ne supporte pas les mauvais perdants.",
  "Râle dès qu'il pioche une mauvaise carte.",
  "Boude silencieusement quand il perd.",
  "Surnommé le roi de la mauvaise foi.",
  "Prétend que les règles changent en cours de route."
];

const PRESET_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZNvniEMANB7oOLI39p7aqpV6uNbkuiE_MtYMHqm1KB3PNatlWSO3H8tdRY23ghZTbTsGkxi3L0gSZDHK1xqd1lS_blQ6Z_eCKjLCXD8m7aA--eJVVydz843HrHoepqeQsU_5B0YZxWKehx8yyKuBtlZ8_Tl-Juye_SkjsbOO24HxokhqFSqyqVh3zzt393qgtWH4C55C4LFVAwUNfuSBDhnDe9fKLJuLfDTGfp8HCx-Or4zC702U3VR2_I34sVLwJTUfiyFBIB0c",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1utXBxP-J5exPJaUjKEgRFjZbIZfVKBClrhy-f8QPtTmjNtVGpL-SsveOU-bEseJdPHRZLgpNIUZMUk0nTQvvLCcohKKCgzcEUev2cpEPfiK_TRPptVba0VJ0BCj_bxZZPGINpAwdtBEK1AptqKmnXES11w83Q59hw3uMXrht3vhMS8n9btXfitsGEV9-BdMYnM0Li--EHaRYu9_7TPnxJbCg8rhoiMxhjQgONTn7RJ3EkuvJwjkIborF9-LGcemfGO7YTZ6OTrg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBaJRKZ4qEJjyYEGZPqFnaIb7zUW3TN__o-cpgGc5Vrk11CMRolIcTpJ9mm-q_wNekoMy-xMMVyrpqfLc8-xqSohG758MMaTUgOAzvxs5e4s3eyolmGzRVqWdxKsdtv1YztFdWL-AdmXwmf5e-G3-Jlw-GBIEHM8bt90wgGv4h0XyOssqI_cZcsoHIQr5vMz-GrlC29BgJCQ1xO6eDlnTlMDPdROphYcg3XaxBVeVLiqmximajl2cxYjDuqTARkv68cblGVh2ASfzo"
];

export default function JoueursView({
  players,
  onUpdatePlayers,
  onStartGame,
  isGM = true,
  isSpectator = false,
  multiplayerMode = "local",
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onDisconnectRoom,
  roomCode = null,
  clientId,
}: JoueursViewProps) {
  const isReadOnly = multiplayerMode === "multiplayer" && !isGM;

  const isPlayerEditable = (p: Player) => {
    if (isSpectator) return false;
    if (multiplayerMode === "local") return true;
    if (isGM) return true;
    return p.id === clientId;
  };

  const [avatarPickerState, setAvatarPickerState] = useState<{
    isOpen: boolean;
    playerId: string | null;
  }>({
    isOpen: false,
    playerId: null,
  });

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => {
    const cached = localStorage.getItem("chouine_saved_profiles");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "sp-1",
        name: "Balthazar",
        subtitle: "Prêt à chouiner pour la victoire.",
        avatar: PRESET_AVATARS[0],
        color: "amber"
      },
      {
        id: "sp-2",
        name: "Gaston",
        subtitle: "Râle dès qu'il pioche une mauvaise carte.",
        avatar: PRESET_AVATARS[1],
        color: "emerald"
      },
      {
        id: "sp-3",
        name: "Simone",
        subtitle: "Boude silencieusement quand elle perd.",
        avatar: PRESET_AVATARS[2],
        color: "rose"
      }
    ];
  });

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleSaveProfile = (p: Player) => {
    const existingIndex = savedProfiles.findIndex(
      (sp) => sp.name.trim().toLowerCase() === p.name.trim().toLowerCase() || sp.id === p.id
    );
    let updated: SavedProfile[];
    if (existingIndex >= 0) {
      updated = savedProfiles.map((sp, idx) =>
        idx === existingIndex
          ? { id: sp.id, name: p.name, subtitle: p.subtitle, avatar: p.avatar, color: p.color }
          : sp
      );
    } else {
      updated = [
        ...savedProfiles,
        { id: Math.random().toString(36).substring(2, 9), name: p.name, subtitle: p.subtitle, avatar: p.avatar, color: p.color }
      ];
    }
    setSavedProfiles(updated);
    localStorage.setItem("chouine_saved_profiles", JSON.stringify(updated));
    setSavedFeedback(`Profil "${p.name}" enregistré sur cet appareil !`);
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  const handleAddSavedProfileToGame = (sp: SavedProfile) => {
    if (players.length >= 5) {
      alert("La Chouine se joue à 5 joueurs maximum !");
      return;
    }
    if (players.some((p) => p.name.trim().toLowerCase() === sp.name.trim().toLowerCase())) {
      alert(`${sp.name} fait déjà partie de la partie !`);
      return;
    }

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: sp.name,
      subtitle: sp.subtitle || DEFAULT_SUBTITLES[0],
      avatar: sp.avatar,
      scoreActuel: 0,
      scoresParManche: [],
      chouinages: 0,
      chouinagesParManche: [],
      plisParManche: [],
      parisParManche: [],
      parissValides: [],
      color: sp.color || PLAYER_COLORS[players.length % PLAYER_COLORS.length].id
    };
    onUpdatePlayers([...players, newPlayer]);
  };

  const handleDeleteSavedProfile = (id: string, name: string) => {
    const filtered = savedProfiles.filter((sp) => sp.id !== id);
    setSavedProfiles(filtered);
    localStorage.setItem("chouine_saved_profiles", JSON.stringify(filtered));
    setSavedFeedback(`Profil "${name}" retiré de vos favoris.`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleNameChange = (id: string, newName: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, name: newName } : p
    );
    onUpdatePlayers(updated);
  };

  const handleSubtitleChange = (id: string, newSubtitle: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, subtitle: newSubtitle } : p
    );
    onUpdatePlayers(updated);
  };

  const handleAvatarChange = (id: string, newAvatar: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, avatar: newAvatar } : p
    );
    onUpdatePlayers(updated);
  };

  const handleColorChange = (id: string, newColor: string) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, color: newColor } : p
    );
    onUpdatePlayers(updated);
  };

  const handleAddPlayer = () => {
    if (players.length >= 5) {
      alert("La Chouine se joue à 5 joueurs maximum !");
      return;
    }
    const defaultAvatars = PRESET_AVATARS;
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    const randomSub = DEFAULT_SUBTITLES[Math.floor(Math.random() * DEFAULT_SUBTITLES.length)];
    const nextNum = players.length + 1;
    
    // Trouver une couleur non encore utilisée
    const takenColors = players.map((p, pIdx) => p.color || getPlayerColorPreset(undefined, pIdx).id);
    const availableColorPreset = PLAYER_COLORS.find(c => !takenColors.includes(c.id));
    const defaultColor = availableColorPreset ? availableColorPreset.id : PLAYER_COLORS[players.length % PLAYER_COLORS.length].id;

    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Joueur ${nextNum}`,
      subtitle: randomSub,
      avatar: randomAvatar,
      scoreActuel: 0,
      scoresParManche: [],
      chouinages: 0,
      chouinagesParManche: [],
      plisParManche: [],
      parisParManche: [],
      parissValides: [],
      color: defaultColor
    };
    onSelectAvatar(newPlayer);
  };

  const onSelectAvatarDataUrl = (avatarUrl: string) => {
    if (activePlayerIdForAvatar) {
      handleAvatarChange(activePlayerIdForAvatar, avatarUrl);
    }
  };

  const onSelectAvatar = (newPlayer: Player) => {
    onUpdatePlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) {
      alert("Il doit y avoir au moins un joueur !");
      return;
    }
    const filtered = players.filter((p) => p.id !== id);
    // Renommer les numéros par défaut éventuellement
    const updated = filtered.map((p, index) => {
      if (p.name.startsWith("Joueur ")) {
        return { ...p, name: `Joueur ${index + 1}` };
      }
      return p;
    });
    onUpdatePlayers(updated);
  };

  const activePlayerIdForAvatar = avatarPickerState.playerId;
  const activeCurrentAvatar = players.find((p) => p.id === activePlayerIdForAvatar)?.avatar || "";

  return (
    <div className="w-full max-w-xl mx-auto pb-32">

      {/* Visual background illustrations overlays */}
      <span className="material-symbols-outlined absolute top-4 -left-4 text-tertiary/10 dark:text-primary-fixed-dim/5 -rotate-12 scale-150 select-none pointer-events-none">
        mood
      </span>
      <span className="material-symbols-outlined absolute top-20 -right-2 text-primary/10 dark:text-secondary-fixed-dim/5 rotate-12 scale-125 select-none pointer-events-none">
        face_6
      </span>

      {/* Segment Header */}
      <div className="text-center mb-6">
        <h2 className="font-headline-md text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-secondary" />
          Les Joueurs
        </h2>
        <div className="decorative-divider"></div>
      </div>

      {/* Feedback message for profile savings */}
      <AnimatePresence>
        {savedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{savedFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mes Chouineurs Enregistrés (Bibliothèque Locale de Profils) */}
      <div className="mb-6 p-4 bg-surface-container-low/70 dark:bg-surface-container/30 border-2 border-outline-variant/60 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-primary" />
            <span className="font-label-lg text-xs uppercase tracking-wider font-black text-primary dark:text-primary-fixed-dim">
              Mes Chouineurs Enregistrés ({savedProfiles.length})
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant italic">
            Appareil local
          </span>
        </div>

        {savedProfiles.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic py-1 text-center">
            Aucun profil enregistré. Cliquez sur "Enregistrer" sur une carte joueur pour le conserver.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedProfiles.map((sp) => {
              const isAlreadyInGame = players.some(
                (p) => p.name.trim().toLowerCase() === sp.name.trim().toLowerCase()
              );
              return (
                <div
                  key={sp.id}
                  className={`inline-flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border text-xs font-bold transition-all ${
                    isAlreadyInGame
                      ? "bg-surface-variant/50 border-outline-variant text-on-surface-variant opacity-70"
                      : "bg-surface-bright dark:bg-stone-800 border-primary/30 text-on-surface hover:border-primary shadow-2xs hover:scale-102"
                  }`}
                >
                  <img
                    src={sp.avatar}
                    alt={sp.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0 border border-black/20"
                  />
                  <span>{sp.name}</span>
                  {!isAlreadyInGame ? (
                    <button
                      type="button"
                      onClick={() => handleAddSavedProfileToGame(sp)}
                      disabled={players.length >= 5}
                      className="ml-1 text-primary hover:text-primary-hover font-black text-[11px] cursor-pointer hover:underline"
                      title="Ajouter ce chouineur à la partie"
                    >
                      + Ajouter
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 ml-1">
                      <UserCheck className="w-3 h-3" /> En jeu
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteSavedProfile(sp.id, sp.name)}
                    className="ml-1 text-on-surface-variant/50 hover:text-red-500 cursor-pointer"
                    title="Supprimer ce profil des favoris"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* List of Player Cards */}
      <div className="flex flex-col gap-6 px-1">
        {players.map((player, index) => {
          // Déterminer la rotation du rendu
          const rotationClass =
            index % 3 === 0
              ? "-rotate-1"
              : index % 3 === 1
              ? "rotate-1"
              : "-rotate-0.5";

          const colorPreset = getPlayerColorPreset(player.color, index);

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-surface-container-low dark:bg-surface-container-high/40 p-6 sketchy-border shadow-md hover:rotate-0 hover:scale-[1.01] transition-all relative ${rotationClass}`}
            >
              <div className="corner-flourish flourish-tl"></div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar with dynamic Camera trigger override */}
                <div className="relative group">
                  <div
                    className={`w-24 h-24 rounded-full border-4 ${colorPreset.borderClass} overflow-hidden bg-surface-bright dark:bg-surface-dim shadow-inner relative flex items-center justify-center`}
                  >
                    <img
                      src={player.avatar}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Camera overlay button */}
                  {isPlayerEditable(player) && (
                    <button
                      onClick={() =>
                        setAvatarPickerState({ isOpen: true, playerId: player.id })
                      }
                      className="absolute -bottom-1 -right-1 bg-secondary hover:bg-secondary-container text-on-secondary p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-on-background dark:border-surface-variant cursor-pointer"
                      title="Prendre / Changer d'avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Input Details */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-lg text-tertiary dark:text-primary-fixed-dim text-xs uppercase tracking-wider flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      Chouineur n°{index + 1}
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveProfile(player)}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-all cursor-pointer"
                        title="Enregistrer ce profil (nom + avatar) dans vos Chouineurs habituels"
                      >
                        <Save className="w-3 h-3" />
                        <span className="hidden sm:inline">Enregistrer</span>
                      </button>

                      {/* Button trash to delete a player */}
                      {players.length > 1 && !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          title="Supprimer ce joueur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Name field */}
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    disabled={!isPlayerEditable(player)}
                    className="w-full bg-transparent border-b-2 border-outline-variant/60 focus:border-primary focus:ring-0 text-headline-sm dark:text-on-surface font-headline-sm px-0 py-1 transition-colors italic focus:outline-none disabled:opacity-85 disabled:cursor-default"
                    placeholder="Nom du chouineur..."
                  />

                  {/* Subtitle Input and description icon row */}
                  <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant dark:text-on-surface-variant/80">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <input
                      type="text"
                      value={player.subtitle}
                      onChange={(e) =>
                        handleSubtitleChange(player.id, e.target.value)
                      }
                      disabled={!isPlayerEditable(player)}
                      className="w-full bg-transparent bg-none italic border-none p-0 text-xs focus:ring-0 text-on-surface-variant/90 dark:text-on-surface-variant focus:outline-none disabled:opacity-85 disabled:cursor-default"
                      placeholder="Devise ou caricature de chouineur..."
                    />
                  </div>

                  {/* Player Color Picker Select Row */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-outline-variant/30 pt-3">
                    <span className="text-xs font-bold text-on-surface-variant/80 dark:text-on-surface-variant/70 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                      <span className="inline-block w-2.5 h-2.5 rounded-full transition-colors duration-300" style={{ backgroundColor: colorPreset.hex }}></span>
                      Couleur :
                    </span>
                    <div className="flex items-center gap-2">
                      {PLAYER_COLORS.map((col) => {
                        const isSelected = player.color === col.id || (!player.color && getPlayerColorPreset(undefined, index).id === col.id);
                        const otherPlayerWhoTookIt = players.find((p, pIdx) => p.id !== player.id && (p.color || getPlayerColorPreset(undefined, pIdx).id) === col.id);
                        const isTakenByOther = !!otherPlayerWhoTookIt;
                        const colDisabled = !isPlayerEditable(player) || isTakenByOther;

                        return (
                          <button
                            key={col.id}
                            type="button"
                            disabled={colDisabled}
                            onClick={() => !colDisabled && handleColorChange(player.id, col.id)}
                            className={`w-7 h-7 rounded-full transition-all duration-200 relative flex items-center justify-center border-2 ${
                              isSelected 
                                ? "border-on-surface scale-110 shadow-md ring-2 ring-primary/45" 
                                : isTakenByOther
                                ? "border-transparent opacity-25 cursor-not-allowed saturate-30"
                                : colDisabled
                                ? "opacity-30 cursor-default"
                                : "border-outline-variant hover:border-on-surface hover:scale-115 cursor-pointer"
                            } ${col.bgClass}`}
                            title={isTakenByOther ? `${col.name} (Pris par ${otherPlayerWhoTookIt.name})` : !isPlayerEditable(player) ? `${col.name} (Lecture Seule)` : col.name}
                          >
                            {isSelected && (
                              <svg className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isTakenByOther && (
                              <svg className="w-4 h-4 text-white/80 stroke-[2] absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <line x1="18" y1="6" x2="6" y2="18" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Dynamic add Chouineur button */}
        {!isReadOnly && (
          <button
            onClick={handleAddPlayer}
            disabled={players.length >= 5}
            className={`group flex items-center justify-center gap-2 p-5 border-4 border-dashed rounded-xl transition-all duration-300 relative ${
              players.length >= 5
                ? "border-outline-variant/40 text-on-surface-variant/40 bg-black/5 dark:bg-white/5 cursor-not-allowed select-none"
                : "border-outline-variant/80 dark:border-outline-variant/40 text-on-surface-variant dark:text-on-surface-variant/80 hover:border-primary hover:text-primary dark:hover:border-primary-fixed-dim dark:hover:text-primary-fixed-dim hover:bg-primary/5 hover:translate-y-[-2px] cursor-pointer"
            }`}
          >
            <Plus className={`w-6 h-6 ${players.length >= 5 ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span className="font-headline-sm uppercase tracking-wider text-base sm:text-lg">
              {players.length >= 5 ? "Nouveau Chouineur (Max. 5 atteint)" : "Nouveau Chouineur"}
            </span>
          </button>
        )}
      </div>

      {/* Warning Callout Box */}
      <div className="mt-8 mx-1 p-6 bg-tertiary-fixed-dim text-on-tertiary-fixed border-on-background dark:border-primary-fixed-dim/20 border-2 rotate-1 shadow-[6px_6px_0px_rgba(105,76,0,0.25)] rounded-lg relative overflow-hidden transition-colors">
        <div className="absolute -right-4 -top-4 opacity-10 rotate-12 pointer-events-none">
          <Smile className="w-20 h-20 text-tertiary" />
        </div>
        <div className="flex gap-4 relative z-10">
          <AlertCircle className="w-6 h-6 text-tertiary shrink-0" />
          <p className="font-body-md leading-tight italic font-bold">
            Rappel : La chouine est autorisée, mais la mauvaise foi est obligatoire pour gagner !
          </p>
        </div>
      </div>

      {/* Primary Lancer la Partie CTA Trigger */}
      <div className="mt-8 px-1 pb-4">
        {isReadOnly ? (
          <div className="sketchy-border bg-blue-100/10 dark:bg-blue-950/20 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></span>
            <div className="text-sm">
              <p className="font-black text-primary dark:text-primary-fixed-dim uppercase tracking-wider">Lobby Royal Multijoueur actif 👑</p>
              <p className="text-xs text-on-surface-variant italic mt-1 max-w-sm">
                En attente du Maître du Jeu pour finaliser la liste et lancer le sacre !
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onStartGame}
              className={`w-full py-4 px-6 rounded-xl font-headline-sm text-base sm:text-lg uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg relative border-2 ${
                players.length < 3 || players.length > 5
                  ? "bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-500 border-dashed border-stone-300 dark:border-stone-700 cursor-not-allowed select-none"
                  : "bg-primary text-on-primary hover:bg-primary-hover border-transparent hover:translate-y-[-2px] active:translate-y-[0px] cursor-pointer"
              }`}
            >
              <Play className={`w-5 h-5 shrink-0 ${players.length >= 3 && players.length <= 5 ? "animate-pulse" : ""}`} />
              <span>Commencer la Partie ({players.length} Chouineurs)</span>
            </button>

            {players.length < 3 && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-red-600 dark:text-red-400 font-semibold text-xs text-center">
                <span className="inline-block animate-bounce">⚠️</span>
                <span>Un minimum de 3 Chouineurs est requis pour jouer. Ajoutez d'autres joueurs !</span>
              </div>
            )}
            {players.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-red-600 dark:text-red-400 font-semibold text-xs text-center">
                <span className="inline-block animate-bounce">⚠️</span>
                <span>Un maximum de 5 Chouineurs est autorisé pour jouer. Retirez des joueurs !</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Avatar Changer modal container */}
      <AvatarPickerModal
        isOpen={avatarPickerState.isOpen}
        onClose={() => setAvatarPickerState({ isOpen: false, playerId: null })}
        onSelectAvatar={onSelectAvatarDataUrl}
        currentAvatar={activeCurrentAvatar}
      />
    </div>
  );
}
