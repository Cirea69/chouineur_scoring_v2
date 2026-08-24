import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Crown,
  ChevronRight,
  RotateCcw,
  Share2,
  Trash2,
  TrendingUp,
  FileMinus,
  Sparkles,
  BookmarkCheck,
  Shield,
  Lightbulb,
  ArrowRight,
  Download,
  Check,
  Frown,
  Eye,
  X,
  Table,
  Globe,
  Lock,
  UploadCloud,
  CheckCircle2
} from "lucide-react";
import { Player, HistoriquePartie } from "../types";
import { PARI_CARDS, checkPariMatch, getPlayerColorPreset } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { pb } from "../lib/pocketbase";

interface ScoresViewProps {
  players: Player[];
  status: "saisie" | "termine";
  mancheActuelle: number;
  onResetGame: () => void;
  historique: HistoriquePartie[];
  onDeleteHistoryEntry: (id: string) => void;
  onShareHistoryEntry?: (entry: HistoriquePartie) => Promise<boolean>;
  onUnshareHistoryEntry?: (id: string) => Promise<boolean>;
  onBackToGame: () => void;
  onSyncCloud?: () => void;
  currentUser?: any;
}

// Icones pour les tours
const TOUR_ICONS = ["castle", "magic_button", "score", "pest_control", "star", "shield"];

export default function ScoresView({
  players,
  status,
  mancheActuelle,
  onResetGame,
  historique,
  onDeleteHistoryEntry,
  onShareHistoryEntry,
  onUnshareHistoryEntry,
  onBackToGame,
  onSyncCloud,
  currentUser,
}: ScoresViewProps) {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoriquePartie | null>(null);
  const [showDetailedMatrix, setShowDetailedMatrix] = useState<boolean>(false);

  const [historyTab, setHistoryTab] = useState<"local" | "public">("local");
  const [publicHistory, setPublicHistory] = useState<HistoriquePartie[]>([]);
  const [loadingPublic, setLoadingPublic] = useState<boolean>(false);
  const [sharingMap, setSharingMap] = useState<Record<string, boolean>>({});

  // Dedicated Share Modal state for maximum reliability
  const [shareModalData, setShareModalData] = useState<{
    entry: HistoriquePartie;
    summaryText: string;
  } | null>(null);
  const [shareModalCopied, setShareModalCopied] = useState<boolean>(false);

  // Ref for local history to avoid effect re-triggers
  const historiqueRef = useRef(historique);
  useEffect(() => {
    historiqueRef.current = historique;
  }, [historique]);

  const handleFetchPublicHistory = useCallback(async () => {
    try {
      const currentLocal = historiqueRef.current || [];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const [pbRes, apiRes] = await Promise.allSettled([
        pb.getHistory(),
        fetch("/api/history", { signal: controller.signal })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      ]);

      clearTimeout(timeoutId);

      const pbList: HistoriquePartie[] =
        pbRes.status === "fulfilled" && Array.isArray(pbRes.value) ? pbRes.value : [];
      const apiList: HistoriquePartie[] =
        apiRes.status === "fulfilled" && Array.isArray(apiRes.value) ? apiRes.value : [];

      const combinedMap = new Map<string, HistoriquePartie>();

      // 1. Express API history items
      if (Array.isArray(apiList)) {
        apiList
          .filter((item) => item.isShared !== false)
          .forEach((item) => combinedMap.set(item.id, item));
      }

      // 2. PocketBase history items
      if (Array.isArray(pbList)) {
        pbList
          .filter((item) => item.isShared !== false)
          .forEach((item) => combinedMap.set(item.id, item));
      }

      // 3. Local history overrides (shared local items stay shared, unshared local items removed)
      if (Array.isArray(currentLocal)) {
        currentLocal.forEach((item) => {
          if (item.isShared) {
            combinedMap.set(item.id, { ...item, isShared: true });
          } else {
            combinedMap.delete(item.id);
          }
        });
      }

      setPublicHistory(Array.from(combinedMap.values()));
    } catch (e) {
      console.warn("Échec de récupération de l'historique public:", e);
    } finally {
      setLoadingPublic(false);
    }
  }, []);

  // Sync local shared items into publicHistory immediately whenever local history updates
  useEffect(() => {
    if (historique && Array.isArray(historique)) {
      const localShared = historique.filter((h) => h.isShared);
      setPublicHistory((prev) => {
        const combined = new Map<string, HistoriquePartie>();
        prev.forEach((item) => combined.set(item.id, item));
        localShared.forEach((item) => combined.set(item.id, { ...item, isShared: true }));
        historique.forEach((item) => {
          if (item.isShared === false) combined.delete(item.id);
        });
        return Array.from(combined.values());
      });
    }
  }, [historique]);

  // Handle Communauté tab activation with non-blocking background fetch
  useEffect(() => {
    if (historyTab === "public") {
      handleFetchPublicHistory();

      const interval = setInterval(() => {
        handleFetchPublicHistory();
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [historyTab, handleFetchPublicHistory]);

  const handleShareEntry = (entry: HistoriquePartie) => {
    if (!entry) return;
    try {
      // Safe extraction of properties
      const gagnantName = entry.gagnant?.name || "Gagnant";
      const gagnantScore = entry.gagnant?.score ?? 0;
      const perdantsList = Array.isArray(entry.perdants) ? entry.perdants : [];

      let summaryText = `🏆 Chouineurs - Partie du ${entry.date || "récente"} 🏆\n\n`;
      summaryText += `🥇 Gagnant : ${gagnantName} (${gagnantScore} pts)\n`;
      if (perdantsList.length > 0) {
        summaryText += `🥈 Perdants : ` + perdantsList.map((p) => `${p.name || 'Joueur'} (${p.score ?? 0} pts)`).join(", ") + `\n`;
      }
      summaryText += `\nRejoignez la partie sur Chouineurs !`;

      // 1. OPEN SHARE MODAL IMMEDIATELY (SYNCHRONOUS UI RESPONSE)
      setShareModalCopied(false);
      setShareModalData({
        entry,
        summaryText
      });

      // 2. Try copying to clipboard immediately in the user gesture callstack
      copyTextToClipboard(summaryText).then((copied) => {
        if (copied) {
          setShareModalCopied(true);
        }
      });

      // 3. Mise à jour instantanée optimiste pour l'onglet Communauté
      const updatedEntry = { ...entry, isShared: true };
      setPublicHistory((prev) => [
        updatedEntry,
        ...prev.filter((p) => p.id !== entry.id)
      ]);

      // 4. Fire background network sync asynchronously without blocking UI
      if (onShareHistoryEntry) {
        setSharingMap((prev) => ({ ...prev, [entry.id]: true }));
        onShareHistoryEntry(entry)
          .then(() => handleFetchPublicHistory())
          .catch((e) => console.warn("Share sync warning:", e))
          .finally(() => setSharingMap((prev) => ({ ...prev, [entry.id]: false })));
      }
    } catch (err) {
      console.error("Error in handleShareEntry:", err);
      setCopiedNotification("Partie enregistrée dans la communauté !");
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  const handleUnshareEntry = async (entryId: string) => {
    if (!entryId) return;
    try {
      // 1. Mise à jour instantanée optimiste dans l'UI
      setPublicHistory((prev) => prev.filter((item) => item.id !== entryId));
      setCopiedNotification("Partie retirée de la communauté !");
      setTimeout(() => setCopiedNotification(null), 3000);

      // 2. Synchronisation réseau en arrière-plan
      if (onUnshareHistoryEntry) {
        await onUnshareHistoryEntry(entryId);
        handleFetchPublicHistory();
      }
    } catch (err) {
      console.error("Erreur lors du retrait de la communauté:", err);
    }
  };

  // Trier les joueurs par score décroissant pour déterminer le classement
  // Règle de départage : 1. Score total, 2. Score de la 4e (dernière) manche
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.scoreActuel !== a.scoreActuel) {
      return b.scoreActuel - a.scoreActuel;
    }
    // Départage sur la 4e manche (index 3)
    const scoreLastRoundA = a.scoresParManche?.[3] ?? 0;
    const scoreLastRoundB = b.scoresParManche?.[3] ?? 0;
    return scoreLastRoundB - scoreLastRoundA;
  });

  // Extraire le podium
  const podium1 = sortedPlayers[0];
  const podium2 = sortedPlayers[1];
  const podium3 = sortedPlayers[2];
  const restOfTheKingdom = sortedPlayers.slice(3);

  const color1 = podium1 ? getPlayerColorPreset(podium1.color, 0) : null;
  const color2 = podium2 ? getPlayerColorPreset(podium2.color, 1) : null;
  const color3 = podium3 ? getPlayerColorPreset(podium3.color, 2) : null;

  // Générer des statistiques loufoques 100% réelles issues de la partie
  // 1. Le Plus Grand Chouineur (basé sur l'ensemble des chouinages réels)
  // Règle de départage Solution 1 :
  // - 1er critère: Nombre total de chouines (décroissant)
  // - 2e critère (départage): Score total le plus bas (le pire score l'emporte, car râler en bas de tableau est l'essence du Chouineur !)
  // - 3e critère: Score à la 4e manche le plus bas
  const sortedChouineurs = [...players].sort((a, b) => {
    const chouineA = a.chouinages || 0;
    const chouineB = b.chouinages || 0;
    if (chouineB !== chouineA) {
      return chouineB - chouineA;
    }
    // Départage Solution 1 : Le score total le plus bas l'emporte !
    if (a.scoreActuel !== b.scoreActuel) {
      return a.scoreActuel - b.scoreActuel;
    }
    // Si égalité de score total, départage sur la 4e manche la plus faible
    const lastRoundA = a.scoresParManche?.[3] ?? 0;
    const lastRoundB = b.scoresParManche?.[3] ?? 0;
    return lastRoundA - lastRoundB;
  });

  const grandChouineur = sortedChouineurs[0];
  const maxChouineCount = grandChouineur ? (grandChouineur.chouinages || 0) : 0;
  
  // Vérifier s'il y avait une égalité initiale sur le nombre de chouines
  const playersWithMaxChouines = players.filter((p) => (p.chouinages || 0) === maxChouineCount && maxChouineCount > 0);
  const isChouineurTieBroken = playersWithMaxChouines.length > 1;

  // Détecter si l'égalité persiste même après le départage par le pire score
  const tiedChouineurs = playersWithMaxChouines.filter(
    (p) => p.scoreActuel === grandChouineur.scoreActuel && (p.scoresParManche?.[3] ?? 0) === (grandChouineur.scoresParManche?.[3] ?? 0)
  );

  // 2. Le Maître des Paris (basé sur le nombre réel de paris validés avec succès)
  const maitreDesParis = [...players].sort((a, b) => (b.parissValides?.length || 0) - (a.parissValides?.length || 0))[0];
  const maxParisValides = maitreDesParis ? (maitreDesParis.parissValides?.length || 0) : 0;

  // 3. Le Glouton des Plis (basé sur le total réel de plis remportés au fil des manches)
  const getPlayerTotalPlis = (p: Player) => (p.plisParManche || []).reduce((acc, curr) => acc + curr, 0);
  const gloutonDesPlis = [...players].sort((a, b) => getPlayerTotalPlis(b) - getPlayerTotalPlis(a))[0];
  const maxTotalPlis = gloutonDesPlis ? getPlayerTotalPlis(gloutonDesPlis) : 0;

  // 4. L'Éclair de Génie (meilleur score individuel sur une seule manche)
  let bestRoundPlayer: Player | null = null;
  let maxSingleRoundScore = 0;
  let bestRoundIndex = 1;

  players.forEach((p) => {
    (p.scoresParManche || []).forEach((score, idx) => {
      if (score > maxSingleRoundScore) {
        maxSingleRoundScore = score;
        bestRoundPlayer = p;
        bestRoundIndex = idx + 1;
      }
    });
  });

  const copyTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // Fallback below
    }
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  const handleShareScore = async () => {
    let entryToShare: HistoriquePartie | null = null;
    if (historique && historique.length > 0) {
      entryToShare = historique[0];
    } else if (sortedPlayers && sortedPlayers.length > 0) {
      const winner = sortedPlayers[0];
      const losers = sortedPlayers.slice(1).map((lp) => ({ name: lp.name, score: lp.scoreActuel, avatar: lp.avatar }));
      entryToShare = {
        id: "game-" + Date.now(),
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        gagnant: { name: winner.name, score: winner.scoreActuel, avatar: winner.avatar },
        perdants: losers,
        detailsJoueurs: sortedPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          scoreActuel: p.scoreActuel,
          chouinages: p.chouinages || 0,
          scoresParManche: p.scoresParManche,
          plisParManche: p.plisParManche,
          chouinagesParManche: p.chouinagesParManche,
          chouinesPointsParManche: p.chouinesPointsParManche,
          parisParManche: p.parisParManche,
        })),
        isShared: true,
      };
    }

    if (entryToShare) {
      await handleShareEntry(entryToShare);
    }
  };

  const handleExportMyLudo = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nom,Score,Chouinages\n" + 
      players.map(p => `"${p.name}",${p.scoreActuel},${p.chouinages}`).join("\n");
    
    const encodedUri = encodeURI(csvServiceString(csvContent));
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chouineurs_scores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedNotification("Données formatées MyLudo exportées avec succès !");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const csvServiceString = (str: string) => str;

  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-32">
      {/* Toast Alert */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-secondary text-on-secondary px-6 py-3 rounded-none font-label-lg shadow-xl border-2 border-black flex items-center gap-2"
          >
            <Check className="w-5 h-5 text-green-300" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAS 1 : LA PARTIE EST FINIE (PODIUM D'HONNEUR & STATISTIQUES LOUFOQUES) */}
      {status === "termine" && (
        <div className="space-y-12">
          {/* Header Banner */}
          <section className="text-center space-y-4">
            <div className="inline-block px-6 py-2 bg-secondary-container rounded-full transform -rotate-1 mb-2 shadow-md">
              <span className="font-label-lg text-xs tracking-widest font-bold text-on-secondary-container uppercase">
                Fin de la Partie
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim">
              La partie est finie...
            </h2>
            <p className="font-body-lg text-sm sm:text-body-lg text-on-surface-variant max-w-lg mx-auto italic">
              "Mais ne vous inquiétez pas, les pleurnicheries ne font que commencer !"
            </p>
          </section>

          {/* Podium Cutout Section */}
          <section className="relative pt-12 pb-4">
            {/* Podium grid with accurate heights */}
            <div className="flex items-end justify-center gap-2 sm:gap-6 h-80 max-w-md mx-auto">
              {/* 2ème Place */}
              {podium2 && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-surface-container-high rounded-full border-4 ${color2?.borderClass || "border-outline-variant"} overflow-hidden mb-4 shadow-sm transform -rotate-2`}>
                    <img
                      className="w-full h-full object-cover shrink-0 grayscale opacity-80"
                      src={podium2.avatar}
                      alt={podium2.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full bg-surface-container-high text-on-surface h-24 rounded-t-xl flex flex-col items-center justify-center border-2 border-outline-variant px-1 text-center shadow-md">
                    <span className="font-headline-md text-xl">2</span>
                    <span className="font-label-md text-xs truncate max-w-full italic px-1 font-bold flex items-center justify-center gap-1">
                      {podium2.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color2?.bgClass}`} title={`Couleur : ${color2?.name}`}></span>
                    </span>
                  </div>
                  <div className="mt-2 font-headline-sm text-sm sm:text-base text-primary dark:text-primary-fixed-dim font-bold">
                    {podium2.scoreActuel} pts
                  </div>
                </div>
              )}

              {/* 1ère Place - Maître Chouineur */}
              {podium1 && (
                <div className="flex flex-col items-center w-32 sm:w-40 z-10 scale-105">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-tertiary-fixed-dim drop-shadow-md animate-bounce">
                      <span
                        className="material-symbols-outlined text-yellow-500 font-bold"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: "48px" }}
                      >
                        crown
                      </span>
                    </div>
                    <div className={`w-full h-full bg-primary-container rounded-full border-8 ${color1 ? color1.borderClass : "border-yellow-400"} overflow-hidden shadow-xl ring-4 ring-background`}>
                      <img
                        className="w-full h-full object-cover scale-105 shadow-inner"
                        src={podium1.avatar}
                        alt={podium1.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="w-full bg-primary text-on-primary h-32 rounded-t-2xl flex flex-col items-center justify-center border-2 border-primary-container px-1 shadow-2xl text-center">
                    <span className="font-headline-md text-2xl">1</span>
                    <h3 className="font-label-lg text-[10px] text-on-primary/80 uppercase tracking-tighter">
                      Maître Chouineur
                    </h3>
                    <p className="font-headline-sm text-sm sm:text-base mt-0.5 truncate max-w-full font-bold flex items-center justify-center gap-1.5 px-1">
                      {podium1.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color1?.bgClass}`} title={`Couleur : ${color1?.name}`}></span>
                    </p>
                  </div>
                  <div className="mt-2 font-headline-md text-secondary dark:text-secondary-fixed-dim text-lg sm:text-xl font-bold">
                    {podium1.scoreActuel} pts
                  </div>
                </div>
              )}

              {/* 3ème Place */}
              {podium3 && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-surface-container-high rounded-full border-4 ${color3?.borderClass || "border-outline-variant"} overflow-hidden mb-4 shadow-sm transform rotate-2`}>
                    <img
                      className="w-full h-full object-cover shrink-0 grayscale opacity-80"
                      src={podium3.avatar}
                      alt={podium3.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full bg-surface-container-high text-on-surface h-20 rounded-t-xl flex flex-col items-center justify-center border-2 border-outline-variant px-1 text-center shadow-md">
                    <span className="font-headline-md text-lg">3</span>
                    <span className="font-label-md text-xs truncate max-w-full italic px-1 font-bold flex items-center justify-center gap-1">
                      {podium3.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color3?.bgClass}`} title={`Couleur : ${color3?.name}`}></span>
                    </span>
                  </div>
                  <div className="mt-2 font-headline-sm text-sm sm:text-base text-primary dark:text-primary-fixed-dim font-bold">
                    {podium3.scoreActuel} pts
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Decorative Divider */}
          <div className="decorative-flourish"></div>

          {/* Le reste du Royaume (Rankings 4 and below) */}
          {restOfTheKingdom.length > 0 && (
            <section className="space-y-4 max-w-md mx-auto">
              <h4 className="font-headline-sm text-lg text-tertiary dark:text-primary-fixed-dim text-center mb-4 uppercase tracking-widest font-bold">
                Le reste du Royaume
              </h4>
              <div className="space-y-3">
                {restOfTheKingdom.map((player, idx) => {
                  const actualRank = idx + 4;
                  const colorPreset = getPlayerColorPreset(player.color, actualRank - 1);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low dark:bg-surface-container-high/20 hand-drawn-border transform rotate-0.5 hover:rotate-0 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="font-headline-sm text-outline text-lg absolute -left-6 top-1/2 -translate-y-1/2">
                            {actualRank}
                          </span>
                          <div className={`w-11 h-11 rounded-xl bg-secondary-fixed overflow-hidden border-2 ${colorPreset.borderClass} rotate-1`}>
                            <img
                              className="w-full h-full object-cover grayscale"
                              src={player.avatar}
                              alt={player.name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <span className="font-label-lg text-sm sm:text-base text-on-surface font-semibold flex items-center gap-1.5">
                          {player.name}
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} title={`Couleur : ${colorPreset.name}`}></span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-headline-sm text-primary dark:text-primary-fixed-dim text-base sm:text-lg">
                          {player.scoreActuel}
                        </span>
                        <span className="font-label-md text-xs text-outline font-bold">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Statistiques Loufoques Grid */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-tertiary-fixed-dim opacity-50"></div>
              <h4 className="font-headline-sm text-sm sm:text-base text-tertiary dark:text-primary-fixed-dim uppercase tracking-widest text-center font-bold">
                Statistiques Loufoques
              </h4>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-tertiary-fixed-dim opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Le Plus Grand Chouineur (chouinages réels) */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-secondary/30 stat-card-shape transform -rotate-1 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      sentiment_very_dissatisfied
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-secondary dark:text-secondary-fixed-dim leading-tight uppercase font-bold">
                    Le Plus Grand Chouineur
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    {maxChouineCount > 0
                      ? isChouineurTieBroken
                        ? tiedChouineurs.length === 1
                          ? `"${grandChouineur?.name} décroche la couronne avec ${maxChouineCount} chouines ! Départagé(e) grâce à son score plus faible (${grandChouineur?.scoreActuel} pts), car râler en bas de tableau est l'essence même du Chouineur !"`
                          : `"Égalité absolue ! ${tiedChouineurs.map((p) => p.name).join(" et ")} ont chouiné ${maxChouineCount} fois et réalisé le même score (${grandChouineur?.scoreActuel} pts) ! Mauvaise foi partagée au sommet."`
                        : `"${grandChouineur ? grandChouineur.name : "Personne"} a utilisé le bouton Chouine ${maxChouineCount} fois durant la partie ! Un vrai râleur d'élite."`
                      : `"Sérénité absolue ! Aucun joueur n'a eu besoin de chouiner pendant toute la partie."`}
                  </p>
                </div>
              </div>

              {/* Stat 2: Le Maître des Paris (paris validés réels) */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-primary/30 stat-card-shape transform rotate-2 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      contract
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-primary dark:text-primary-fixed-dim leading-tight uppercase font-bold">
                    Le Maître des Paris
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    {maxParisValides > 0
                      ? `"${maitreDesParis ? maitreDesParis.name : "Personne"} a validé avec succès ${maxParisValides} pari(s) sur ${mancheActuelle} manche(s) ! Une précision chirurgicale."`
                      : `"Sécheresse de pronostics ! Aucun joueur n'a réussi à valider son pari lors de cette partie."`}
                  </p>
                </div>
              </div>

              {/* Stat 3: Le Glouton des Plis (plis remportés réels) */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-tertiary/30 stat-card-shape transform -rotate-2 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-tertiary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      layers
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-tertiary dark:text-yellow-600 leading-tight uppercase font-bold">
                    Le Glouton des Plis
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    {maxTotalPlis > 0
                      ? `"${gloutonDesPlis ? gloutonDesPlis.name : "Personne"} a raflé un total de ${maxTotalPlis} pli(s) sur l'ensemble de la partie !"`
                      : `"Aucun pli enregistré au cours de la partie."`}
                  </p>
                </div>
              </div>

              {/* Stat 4: L'Éclair de Génie (meilleure manche) */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-amber-500/30 stat-card-shape transform rotate-1 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-amber-500 text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-amber-600 dark:text-amber-400 leading-tight uppercase font-bold">
                    L'Éclair de Génie
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    {maxSingleRoundScore > 0
                      ? `"${bestRoundPlayer ? (bestRoundPlayer as Player).name : "Un joueur"} a signé la meilleure manche avec +${maxSingleRoundScore} pts à la Manche ${bestRoundIndex} !"`
                      : `"Scores très homogènes, pas de grosse envolée constatée."`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Note aux perdants */}
          <section className="bg-surface/40 dark:bg-white/5 p-6 hand-drawn-border transform -rotate-0.5 relative overflow-hidden rounded-lg">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-secondary">flash_on</span>
            </div>
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-yellow-500 shrink-0 mt-1" />
              <div className="space-y-1">
                <span className="font-label-lg text-xs text-tertiary dark:text-primary-fixed-dim uppercase font-bold">
                  Note aux perdants :
                </span>
                <p className="font-body-md text-sm text-on-surface leading-relaxed">
                  En cas d'égalité pour la dernière place, le joueur qui a le plus pleurniché durant la partie est officiellement désigné comme le <span className="font-bold text-secondary">"Chouineur de l'Extrême"</span>. Félicitations, vous gagnez le droit de mélanger les cartes pour la prochaine !
                </p>
              </div>
            </div>
          </section>

          {/* Action buttons */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
            <button
              onClick={onResetGame}
              className="w-full sm:w-auto px-10 py-4 bg-secondary text-on-secondary font-headline-sm text-sm sm:text-base rounded-xl border-b-4 border-r-4 border-black dark:border-white hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer font-bold shadow-lg"
            >
              Nouvelle Partie
            </button>
            <button
              onClick={handleShareScore}
              className="w-full sm:w-auto px-10 py-4 bg-surface-container-high dark:bg-surface-container-highest dark:text-on-surface text-primary border-2 border-primary dark:border-outline hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold rounded-xl"
            >
              <Share2 className="w-5 h-5" />
              Partager le Score
            </button>
          </section>
        </div>
      )}

      {/* CAS 2 : JEU EN COURS (AFFICHAGE DES SCORES ACTUELS ROND PAR ROND) */}
      {status === "saisie" && (
        <div className="space-y-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-headline-md text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim">
              Les Scores Actuels
            </h2>
            <div className="flex items-center justify-center gap-4 text-tertiary">
              <div className="hand-drawn-line max-w-[80px]"></div>
              <span className="material-symbols-outlined font-bold">eco</span>
              <div className="hand-drawn-line max-w-[80px]"></div>
            </div>
          </div>

          {/* standigs loop */}
          <div className="space-y-6">
            {sortedPlayers.map((player, idx) => {
              // Custom text badges on status of range
              const rankTitle = idx === 0 ? "Premier Rang" : idx === 1 ? "En Embuscade" : "L'Artisan Chouineur";
              
              const colorPreset = getPlayerColorPreset(player.color, idx);

              const borderStyles = colorPreset.borderClass;

              const cardRotationClass =
                idx === 0
                  ? "card-rotate-2"
                  : idx === 1
                  ? "card-rotate-1"
                  : "card-rotate-3";

              const scoreBgClass =
                idx === 0
                  ? "bg-primary text-on-primary"
                  : idx === 1
                  ? "bg-secondary text-on-secondary"
                  : "bg-tertiary text-on-tertiary";

              return (
                <div
                  key={player.id}
                  className={`bg-surface-container-lowest dark:bg-surface-container/20 hand-drawn-border p-6 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 ${cardRotationClass} ${borderStyles}`}
                >
                  <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                      <span className="text-label-md text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none">
                        {rankTitle}
                      </span>
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-black leading-tight mt-1 flex items-center gap-1.5">
                        {player.name}
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} title={`Couleur : ${colorPreset.name}`}></span>
                      </h3>
                      <p className="text-[11px] text-on-surface-variant italic mt-0.5">
                        {player.subtitle}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-black w-fit border border-rose-300 dark:border-rose-800/80 shadow-2xs">
                        <Frown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>{(player.chouinages || 0)} {(player.chouinages || 0) > 1 ? "chouines" : "chouine"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-headline-md text-sm sm:text-base px-4 py-1.5 hand-drawn-border -rotate-2 select-none ${scoreBgClass}`}>
                        {player.scoreActuel} pts
                      </div>
                    </div>
                  </div>

                  {/* Tour details additions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {player.scoresParManche.map((s, mIdx) => {
                      const iconName = mIdx === 0 ? "1️⃣" : mIdx === 1 ? "2️⃣" : mIdx === 2 ? "3️⃣" : "4️⃣";
                      
                      const pariId = player.parisParManche?.[mIdx];
                      const plis = player.plisParManche?.[mIdx];
                      const chouinesFlip = player.chouinagesParManche?.[mIdx] || 0;
                      const chouinesPts = player.chouinesPointsParManche?.[mIdx] || 0;
                      const matchedCard = PARI_CARDS.find((c) => c.id === pariId);

                      // Si on a des informations détaillées de la manche
                      if (pariId && plis !== undefined) {
                        const isSuccess = checkPariMatch(pariId, plis) !== null;
                                         return (
                          <div
                            key={mIdx}
                            className="bg-white dark:bg-stone-900/90 p-2.5 rounded-xl border-2 border-outline-variant/80 flex flex-col justify-between text-left transition-colors font-sans shadow-xs"
                          >
                            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-1 mb-1">
                              <span className="text-[10px] font-black uppercase text-[#1f8373] dark:text-secondary-fixed-dim">Manche {mIdx + 1}</span>
                              {matchedCard && (
                                <span 
                                  className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${matchedCard.color}`} 
                                  title={`Pari: ${matchedCard.name}`}
                                />
                              )}
                            </div>
                            <div className="space-y-0.5 text-[10px] font-black text-zinc-900 dark:text-zinc-100 flex-grow">
                              <div className="font-extrabold flex items-center gap-1">
                                <span>🎯</span>
                                <span className="truncate">{matchedCard?.colorName?.replace("Carte ", "")} :</span>
                                <span className={isSuccess ? "text-green-800 dark:text-green-400" : "text-stone-700 dark:text-stone-400"}>
                                  {isSuccess ? "Fait" : "Raté"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                                <span>🃏</span> <span>{plis} {plis > 1 ? "plis" : "pli"}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                                <span>🔄</span> <span>Rot. : {chouinesFlip}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                                <span>🎁</span> <span>Rés. : {chouinesPts} pt{chouinesPts > 1 ? "s" : ""}</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-outline-variant/60 flex justify-between items-center">
                              <span className="font-black text-[11px] text-primary dark:text-primary-fixed-dim">+{s} pts</span>
                              {isSuccess ? (
                                <span className="text-[9px] text-green-700 dark:text-green-400 bg-green-500/15 px-1.5 py-0.2 rounded font-extrabold uppercaseScale">Succès</span>
                              ) : (
                                <span className="text-[9px] text-stone-700 dark:text-stone-400 bg-stone-500/15 px-1.5 py-0.2 rounded font-extrabold uppercaseScale">Échec</span>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Fallback pour compatibilité ascendante si pas encore de détails
                      return (
                        <div
                          key={mIdx}
                          className="flex items-center gap-2 bg-surface-container dark:bg-surface-container-low p-2 rounded-lg border border-outline-variant"
                        >
                          <span className="text-xs shrink-0">{iconName}</span>
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase font-bold text-outline">Tour {mIdx + 1}</span>
                            <span className="font-label-lg text-xs font-semibold">{s} pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle pour le Tableau Détaillé Synthétique */}
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowDetailedMatrix((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-primary dark:text-primary-fixed-dim font-black text-xs py-3 px-5 rounded-xl border border-outline-variant transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Table className="w-4 h-4 text-primary" />
              <span>{showDetailedMatrix ? "Masquer la Synthèse des Manches" : "📊 Voir le Tableau Synthétique des Manches"}</span>
            </button>
          </div>

          {showDetailedMatrix && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-surface-bright dark:bg-stone-900/80 p-4 sm:p-5 rounded-2xl border-2 border-primary/30 shadow-md overflow-x-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-sm text-sm text-primary dark:text-primary-fixed-dim flex items-center gap-2 font-black">
                  <Table className="w-4 h-4" />
                  <span>Synthèse Détaillée de la Partie</span>
                </h3>
                <span className="text-[10px] text-outline font-bold sm:hidden flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
                  <span>↔️</span> Glissez pour voir les manches
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-outline-variant/40">
                <table className="w-full text-left text-xs border-collapse min-w-[520px]">
                  <thead>
                    <tr className="border-b-2 border-outline-variant text-on-surface-variant font-black uppercase tracking-wider text-[10px] bg-surface-container/60">
                      <th className="sticky left-0 z-20 bg-surface-container dark:bg-stone-800 py-2.5 px-3 min-w-[110px] max-w-[140px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.15)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)] border-r border-outline-variant/40">Joueur</th>
                      <th className="py-2.5 px-3 text-center">Score Total</th>
                      <th className="py-2.5 px-3 text-center">Chouines</th>
                      <th className="py-2.5 px-3 text-center">Manche 1</th>
                      <th className="py-2.5 px-3 text-center">Manche 2</th>
                      <th className="py-2.5 px-3 text-center">Manche 3</th>
                      <th className="py-2.5 px-3 text-center">Manche 4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {sortedPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-surface-bright dark:bg-stone-900 py-2.5 px-3 font-black min-w-[110px] max-w-[140px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.15)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)] border-r border-outline-variant/40">
                          <div className="flex items-center gap-2">
                            <img src={player.avatar} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0" />
                            <span className="text-on-surface font-extrabold truncate">{player.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-black text-sm text-primary">{player.scoreActuel} pts</td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800/70">
                            ⚡ {player.chouinages || 0}
                          </span>
                        </td>
                        {[0, 1, 2, 3].map((mIdx) => {
                          const scoreM = player.scoresParManche?.[mIdx];
                          const plisM = player.plisParManche?.[mIdx];
                          const flipM = player.chouinagesParManche?.[mIdx] || 0;
                          const pointM = player.chouinesPointsParManche?.[mIdx] || 0;
                          const totalChouinesM = flipM + pointM;

                          return (
                            <td key={mIdx} className="py-3 px-3 text-center font-mono">
                              {scoreM !== undefined ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="font-extrabold text-xs text-primary">+{scoreM} pts</span>
                                  {plisM !== undefined && (
                                    <span className="text-[9px] text-on-surface-variant font-sans font-semibold">{plisM} {plisM > 1 ? "plis" : "pli"}</span>
                                  )}
                                  {totalChouinesM > 0 ? (
                                    <span className="text-[9px] text-amber-950 dark:text-amber-100 font-sans font-black bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/80 shadow-2xs" title={`${flipM} rotation(s) + ${pointM} bonus`}>
                                      ⚡ {totalChouinesM} ch.
                                    </span>
                                  ) : (
                                    <span className="text-[8px] text-outline font-sans">0 ch.</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-outline">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="mt-16 flex flex-col items-center">
            <button
              onClick={onBackToGame}
              className="w-full max-w-xs bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-label-lg py-4 px-8 border-2 border-black/40 hand-drawn-border shadow-lg hover:opacity-95 transition-all wiggle active:scale-95 group cursor-pointer inline-flex items-center justify-center gap-3 rounded-lg"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-2 transition-transform" />
              <span className="font-bold">RETOUR AU JEU</span>
            </button>
            <p className="mt-4 text-tertiary dark:text-primary-fixed-dim font-label-md text-xs italic opacity-70">
              Prêt pour une nouvelle manche de complaintes et de chouinnages !
            </p>
          </div>
        </div>
      )}

      {/* HISTORIQUE DES MÉFAITS (AVEC TABS SÉCURITÉ & PARTAGE) */}
      <section className="mt-12 pt-8 border-t-2 border-outline-variant/40 space-y-6">
        <div className="text-center">
          <h3 className="font-headline-sm text-xl text-primary dark:text-primary-fixed-dim">
            Historique des Méfaits
          </h3>
          <p className="font-body-md text-xs text-on-surface-variant italic mt-1">
            Retracez vos gloires et vos hontes passées...
          </p>
        </div>

        {/* Dynamic Notification Toast */}
        <AnimatePresence>
          {copiedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{copiedNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Selector: Local Device vs Public Community */}
        <div className="flex justify-center gap-2 p-1 bg-surface-container-low dark:bg-stone-900 border-2 border-outline-variant rounded-xl max-w-md mx-auto">
          <button
            onClick={() => setHistoryTab("local")}
            className={`flex-1 py-2 px-3 rounded-lg font-label-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              historyTab === "local"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mes Parties ({historique.length})</span>
          </button>

          <button
            onClick={() => setHistoryTab("public")}
            className={`flex-1 py-2 px-3 rounded-lg font-label-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              historyTab === "public"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Communauté {publicHistory.length > 0 && `(${publicHistory.length})`}</span>
          </button>
        </div>

        <div className="text-center flex flex-wrap justify-center gap-3">
          <button
            onClick={handleExportMyLudo}
            className="group relative inline-flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary-container px-4 py-2 rounded-lg font-label-lg text-xs border-2 border-black/35 shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter vers MyLudo</span>
          </button>

          {currentUser && onSyncCloud && (
            <button
              onClick={onSyncCloud}
              className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg font-label-lg text-xs border-2 border-primary/40 font-bold hover:scale-102 transition-all cursor-pointer"
              title="Synchroniser vos parties entre smartphone et PC"
            >
              <span>🔄 Synchroniser avec le Cloud</span>
            </button>
          )}
        </div>

        {/* TAB 1: LOCAL HISTORY */}
        {historyTab === "local" && (
          <div className="space-y-4">
            {historique.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant text-on-surface-variant text-xs italic">
                <Lock className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
                <p className="font-bold text-sm">Vos parties restent 100% privées sur cet appareil.</p>
                <p className="mt-1">Terminez une partie pour la retrouver ici dans votre historique personnel !</p>
              </div>
            ) : (
              historique.map((entry) => {
                const isShared = entry.isShared || sharingMap[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="bg-surface-container/60 dark:bg-surface-container/10 p-5 border-2 border-outline-variant rounded-lg relative group transition-all"
                  >
                    <div className="absolute -top-3 -left-2 flex items-center gap-1.5">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-0.5 font-label-md text-[10px] uppercase font-bold border border-tertiary rounded-sm">
                        {entry.date}
                      </span>
                      {isShared ? (
                        <span className="bg-emerald-500 text-white px-2 py-0.5 text-[9px] uppercase font-extrabold rounded-sm flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Partagé
                        </span>
                      ) : (
                        <span className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 text-[9px] uppercase font-extrabold rounded-sm flex items-center gap-1 border border-stone-400/40">
                          <Lock className="w-3 h-3" /> Privé
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-3">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap gap-4 text-left">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                              Gagnant
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-headline-sm text-sm text-primary dark:text-primary-fixed-dim font-black">
                                {entry.gagnant?.name || "Joueur"}
                              </span>
                              <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {entry.gagnant?.score ?? 0} pts
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col border-l border-outline-variant pl-4">
                            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                              Perdants
                            </span>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {(entry.perdants || []).map((p, pIdx) => (
                                <div key={pIdx} className="text-xs flex items-center gap-1">
                                  <span className="font-medium text-on-surface">{p.name}</span>
                                  <span className="text-secondary dark:text-secondary-fixed-dim font-bold">
                                    ({p.score})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1">
                        <button
                          onClick={() => setSelectedHistory(entry)}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-fixed-dim bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20 transition-all cursor-pointer active:scale-95"
                          title="Regarder les détails de cette partie"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détails</span>
                        </button>

                        <button
                          onClick={() => handleShareEntry(entry)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                            !isShared
                              ? "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 bg-emerald-500/10 border-emerald-500/30"
                              : "text-emerald-800 dark:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40"
                          }`}
                          title="Partager ou copier le résumé de cette partie"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isShared ? "Partager à nouveau" : "Partager"}</span>
                        </button>

                        {isShared && onUnshareHistoryEntry && (
                          <button
                            onClick={() => handleUnshareEntry(entry.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95"
                            title="Retirer cette partie de l'espace Communauté"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Ne plus partager</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          className="text-on-surface-variant hover:text-red-500 transition-colors p-2 active:scale-90 cursor-pointer"
                          title="Effacer ce souvenir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PUBLIC COMMUNITY HISTORY */}
        {historyTab === "public" && (
          <div className="space-y-4">
            {publicHistory.length === 0 && loadingPublic ? (
              <div className="p-8 text-center space-y-3">
                <span className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin rounded-full inline-block"></span>
                <p className="text-xs text-on-surface-variant font-bold">Récupération des scores de la communauté...</p>
              </div>
            ) : publicHistory.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant text-on-surface-variant text-xs italic">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50 text-secondary" />
                <p className="font-bold text-sm">Aucune partie n'a encore été partagée par la communauté.</p>
                <p className="mt-1">Soyez le premier à partager votre score local !</p>
              </div>
            ) : (
              publicHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-surface-container/60 dark:bg-surface-container/10 p-5 border-2 border-primary/20 rounded-lg relative transition-all"
                >
                  <div className="absolute -top-3 -left-2 flex items-center gap-1.5">
                    <span className="bg-primary text-on-primary px-3 py-0.5 font-label-md text-[10px] uppercase font-bold rounded-sm shadow-xs">
                      {entry.date}
                    </span>
                    <span className="bg-secondary/20 text-secondary dark:text-secondary-fixed-dim px-2 py-0.5 text-[9px] uppercase font-extrabold rounded-sm flex items-center gap-1 border border-secondary/30">
                      <Globe className="w-3 h-3" /> Communautaire
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-3">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap gap-4 text-left">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                            Gagnant
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-headline-sm text-sm text-primary dark:text-primary-fixed-dim font-black">
                              {entry.gagnant?.name || "Joueur"}
                            </span>
                            <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {entry.gagnant?.score ?? 0} pts
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col border-l border-outline-variant pl-4">
                          <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                            Perdants
                          </span>
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {(entry.perdants || []).map((p, pIdx) => (
                              <div key={pIdx} className="text-xs flex items-center gap-1">
                                <span className="font-medium text-on-surface">{p.name}</span>
                                <span className="text-secondary dark:text-secondary-fixed-dim font-bold">
                                  ({p.score})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1">
                      <button
                        onClick={() => setSelectedHistory(entry)}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-fixed-dim bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20 transition-all cursor-pointer active:scale-95"
                        title="Regarder les détails de cette partie"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>

                      {onUnshareHistoryEntry && (
                        <button
                          onClick={() => handleUnshareEntry(entry.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95"
                          title="Retirer cette partie de l'espace Communauté"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Ne plus partager</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="p-6 border-2 border-dashed border-outline-variant bg-surface-container-low/40 text-center space-y-2 rounded-lg italic">
          <span className="material-symbols-outlined text-3xl opacity-60">history_edu</span>
          <p className="font-body-md text-xs text-on-surface-variant">
            "La mémoire s'efface, mais les scores de MyLudo sont éternels."
          </p>
        </div>
      </section>

      {/* Modal de Détails pour une partie historique */}
      <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-bright dark:bg-stone-900 border-2 border-primary hand-drawn-border rounded-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedHistory(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-on-surface-variant cursor-pointer transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 pr-6">
                <span className="inline-block bg-primary text-on-primary text-[10px] font-black uppercase px-3 py-1 rounded-full mb-1">
                  Partie enregistrée le {selectedHistory.date}
                </span>
                <h3 className="font-headline-sm text-lg sm:text-xl font-black text-primary dark:text-primary-fixed-dim">
                  📊 Synthèse Détaillée de la Partie
                </h3>
              </div>

              {/* Stats & Vainqueur highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-500/10 border-2 border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Crown className="w-7 h-7 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400">Vainqueur</span>
                      <h4 className="font-black text-sm text-on-surface">{selectedHistory.gagnant.name}</h4>
                    </div>
                  </div>
                  <span className="font-black text-sm bg-amber-500 text-black px-2.5 py-1 rounded-lg">
                    {selectedHistory.gagnant.score} pts
                  </span>
                </div>

                {selectedHistory.detailsJoueurs && selectedHistory.detailsJoueurs.length > 0 && (() => {
                  const topChouineur = [...selectedHistory.detailsJoueurs].sort((a, b) => (b.chouinages || 0) - (a.chouinages || 0))[0];
                  return (
                    <div className="bg-secondary/10 border-2 border-secondary/30 p-3.5 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <span className="text-[10px] uppercase font-black text-secondary">Râleur en Chef</span>
                          <h4 className="font-black text-sm text-on-surface">{topChouineur?.name || "Aucun"}</h4>
                        </div>
                      </div>
                      <span className="font-black text-xs bg-secondary text-on-secondary px-2.5 py-1 rounded-lg">
                        {topChouineur?.chouinages || 0} chouines
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Scorecard detail table */}
              {selectedHistory.detailsJoueurs && selectedHistory.detailsJoueurs.length > 0 ? (
                (() => {
                  // Calculer le nombre max de manches enregistrées dans cette partie
                  const maxManches = Math.max(
                    4,
                    ...selectedHistory.detailsJoueurs.map((dj) => dj.scoresParManche?.length || 0)
                  );
                  const mancheIndices = Array.from({ length: maxManches }, (_, i) => i);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline-sm text-xs uppercase font-black text-outline tracking-wider flex items-center gap-1.5">
                          <Table className="w-4 h-4 text-primary" />
                          <span>Détails Manche par Manche</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-outline font-bold sm:hidden flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
                            <span>↔️</span> Glissez
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-bold">
                            {selectedHistory.detailsJoueurs.length} joueurs • {maxManches} manches
                          </span>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-xl border-2 border-outline-variant/60">
                        <table className="w-full text-left text-xs border-collapse min-w-[520px]">
                          <thead>
                            <tr className="bg-surface-container/80 border-b-2 border-outline-variant text-on-surface-variant font-black text-[10px] uppercase tracking-wider">
                              <th className="sticky left-0 z-20 bg-surface-container dark:bg-stone-800 py-2.5 px-3 min-w-[110px] max-w-[140px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.15)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)] border-r border-outline-variant/40">Joueur</th>
                              <th className="py-2.5 px-3 text-center">Score Total</th>
                              <th className="py-2.5 px-3 text-center">Chouines</th>
                              {mancheIndices.map((mIdx) => (
                                <th key={mIdx} className="py-2.5 px-3 text-center">
                                  Manche {mIdx + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/40 bg-surface-bright dark:bg-stone-900/60">
                            {[...selectedHistory.detailsJoueurs]
                              .sort((a, b) => b.scoreActuel - a.scoreActuel)
                              .map((dj) => (
                                <tr key={dj.id} className="hover:bg-surface-container/40 transition-colors">
                                  <td className="sticky left-0 z-10 bg-surface-bright dark:bg-stone-900 py-2.5 px-3 font-black min-w-[110px] max-w-[140px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.15)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)] border-r border-outline-variant/40">
                                    <div className="flex items-center gap-2">
                                      {dj.avatar ? (
                                        <img src={dj.avatar} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0" />
                                      ) : (
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xs shrink-0">
                                          {dj.name.substring(0, 1)}
                                        </div>
                                      )}
                                      <span className="text-on-surface font-extrabold truncate">{dj.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-center font-black text-sm text-primary">
                                    {dj.scoreActuel} pts
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800/70">
                                      ⚡ {dj.chouinages || 0}
                                    </span>
                                  </td>
                                  {mancheIndices.map((mIdx) => {
                                    const scoreM = dj.scoresParManche?.[mIdx];
                                    const plisM = dj.plisParManche?.[mIdx];
                                    const flipM = dj.chouinagesParManche?.[mIdx] || 0;
                                    const pointM = dj.chouinesPointsParManche?.[mIdx] || 0;
                                    const totalChouinesM = flipM + pointM;

                                    return (
                                      <td key={mIdx} className="py-3 px-3 text-center font-mono">
                                        {scoreM !== undefined ? (
                                          <div className="flex flex-col items-center gap-0.5">
                                            <span className="font-extrabold text-xs text-primary">+{scoreM} pts</span>
                                            {plisM !== undefined && (
                                              <span className="text-[9px] text-on-surface-variant font-sans font-bold">
                                                {plisM} {plisM > 1 ? "plis" : "pli"}
                                              </span>
                                            )}
                                            {totalChouinesM > 0 ? (
                                              <span
                                                className="text-[9px] text-amber-950 dark:text-amber-100 font-sans font-black bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 px-2 py-0.5 rounded-full shadow-2xs"
                                                title={`Détail manche ${mIdx + 1} : ${flipM} rotation(s), ${pointM} point(s) bonus`}
                                              >
                                                ⚡ {totalChouinesM} ch.
                                              </span>
                                            ) : (
                                              <span className="text-[8px] text-outline font-sans">0 ch.</span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-outline">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Fallback listing for older records without full detailsJoueurs */
                <div className="space-y-3">
                  <h4 className="font-headline-sm text-xs uppercase font-black text-outline tracking-wider">
                    Classement Final
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl font-bold text-xs">
                      <span className="flex items-center gap-2">
                        <span>🥇 1.</span>
                        {selectedHistory.gagnant.avatar && (
                          <img src={selectedHistory.gagnant.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        )}
                        <span className="font-black text-on-surface">{selectedHistory.gagnant.name}</span>
                      </span>
                      <span className="text-primary font-black text-sm">{selectedHistory.gagnant.score} pts</span>
                    </div>
                    {selectedHistory.perdants.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-surface-container rounded-xl text-xs">
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-outline">{idx + 2}.</span>
                          {p.avatar && (
                            <img src={p.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span className="font-bold">{p.name}</span>
                        </span>
                        <span className="font-black text-primary">{p.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-outline-variant flex gap-3">
                <button
                  onClick={() => handleShareEntry(selectedHistory)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl cursor-pointer transition-all shadow flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Partager cette partie</span>
                </button>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="px-6 py-3 bg-surface-container-high text-on-surface font-black text-xs uppercase rounded-xl hover:bg-surface-container-highest cursor-pointer transition-all border border-outline-variant"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: PARTAGE / COPIE DÉDIÉ */}
        {shareModalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-surface border-2 border-emerald-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <div className="p-2 bg-emerald-500/15 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-black text-on-surface">Partie Publiée & Prête !</h3>
                    <p className="text-[11px] text-on-surface-variant">Enregistrée dans l'historique communautaire</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalData(null)}
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Résumé à partager
                </label>
                <textarea
                  readOnly
                  value={shareModalData.summaryText}
                  rows={6}
                  className="w-full p-3 rounded-xl bg-surface-container dark:bg-surface-container-high border border-outline-variant text-xs font-mono text-on-surface focus:outline-none resize-none"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={async () => {
                    const copied = await copyTextToClipboard(shareModalData.summaryText);
                    if (copied) {
                      setShareModalCopied(true);
                      setTimeout(() => setShareModalCopied(false), 3000);
                    } else {
                      alert("Veuillez sélectionner le texte ci-dessus et le copier manuellement.");
                    }
                  }}
                  className={`flex-1 py-3 px-4 font-black text-xs uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                    shareModalCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-on-primary hover:opacity-90"
                  }`}
                >
                  {shareModalCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Résumé Copié !</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copier le résumé</span>
                    </>
                  )}
                </button>

                {navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: "Scores de Chouineurs",
                          text: shareModalData.summaryText,
                          url: window.location.href,
                        });
                      } catch (e) {
                        // User cancelled
                      }
                    }}
                    className="py-3 px-4 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase rounded-xl border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    title="Partager via WhatsApp, SMS ou vos applications"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>App...</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShareModalData(null)}
                className="w-full py-2.5 text-xs font-bold text-outline hover:text-on-surface uppercase tracking-wider cursor-pointer"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
