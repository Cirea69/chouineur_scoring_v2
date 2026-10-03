import { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Smartphone,
  Users,
  Trophy,
  Wifi,
  Cloud,
  CheckCircle2,
  HelpCircle,
  Play,
  Layers,
  Camera,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const [activeTab, setActiveTab] = useState<"quickstart" | "rules" | "sync" | "tests">("quickstart");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-background dark:bg-surface-dim w-full max-w-2xl max-h-[90vh] flex flex-col hand-drawn-border rounded-2xl shadow-2xl overflow-hidden border-2 border-outline-variant/60"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-surface-container border-b-2 border-outline-variant/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-sm text-base sm:text-lg font-black text-on-surface">
                  Notice d'Utilisation & Guide Testeurs
                </h3>
                <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium">
                  Application Chouineurs • Compagnon de jeu officiel
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer text-on-surface"
              title="Fermer la notice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets de navigation dans la notice */}
          <div className="flex border-b border-outline-variant/20 bg-surface px-2 sm:px-4 gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab("quickstart")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "quickstart"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Prise en main
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "rules"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Règles & Saisie
            </button>

            <button
              onClick={() => setActiveTab("sync")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "sync"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Cloud className="w-3.5 h-3.5" /> PocketBase & Synchro
            </button>

            <button
              onClick={() => setActiveTab("tests")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "tests"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Checklist Testeurs
            </button>
          </div>

          {/* Contenu déroulant */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-on-surface">
            {/* 1. PRISE EN MAIN RAPIDE */}
            {activeTab === "quickstart" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 flex gap-3 items-start">
                  <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Installation sur Smartphone (PWA)</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed">
                      L'application s'installe directement sur l'écran d'accueil sans passer par les stores ! Sur iPhone/Safari : bouton <strong>Partager</strong> &gt; <strong>Sur l'écran d'accueil</strong>. Sur Android/Chrome : cliquez sur <strong>Installer</strong> ou les 3 points &gt; <strong>Ajouter à l'écran d'accueil</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-on-surface">
                      <Users className="w-4 h-4 text-secondary" /> 1. Onglet « Joueurs »
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Configurez 3 à 5 Chouineurs. Changez leurs pseudos, couleurs d'accentuation, et avatars (sélectionnez une illustration ou prenez une photo instantanée par webcam !).
                    </p>
                  </div>

                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-on-surface">
                      <Wifi className="w-4 h-4 text-emerald-600" /> 2. Onglet « Salon »
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Jouez en <strong>Mode Local</strong> (un seul écran) ou en <strong>Mode Multijoueur en ligne</strong> en partageant le code court à 4 lettres généré par le Maître du Jeu.
                    </p>
                  </div>

                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-on-surface">
                      <Play className="w-4 h-4 text-primary" /> 3. Onglet « Partie »
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Saisie guidée en 3 temps par joueur : Le Pari secret, les Chouines (tactiques et points), puis les Plis réalisés. Les scores se calculent automatiquement.
                    </p>
                  </div>

                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-on-surface">
                      <Trophy className="w-4 h-4 text-amber-500" /> 4. Onglet « Scores »
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Tableau des manches, cumul des points, podium final du Sacre Royal à la 4ème manche et historique complet de toutes vos parties passées.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RÈGLES & SAISIE D'UNE MANCHE */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-2">
                  <h4 className="font-bold text-on-surface flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Barème officiel des Cartes Paris
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Chaque joueur doit choisir une carte pari disponible. <em>Attention : une carte réussie est validée et ne peut plus être rejouée dans la partie !</em>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-900 dark:text-orange-300">
                      <strong>🟧 Pari Orange (0-1) :</strong> 0 pli = 8 pts | 1 pli = 3 pts
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
                      <strong>🟩 Pari Vert (0-1-2) :</strong> 0 pli = 2 pts | 1 pli = 8 pts | 2 plis = 5 pts
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300">
                      <strong>🟦 Pari Bleu (2-3-4) :</strong> 2 plis = 3 pts | 3 plis = 9 pts | 4 plis = 4 pts
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-300">
                      <strong>🟥 Pari Rouge (1-2-3) :</strong> 1 pli = 4 pts | 2 plis = 8 pts | 3 plis = 4 pts
                    </div>
                    <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-500 dark:border-purple-400 text-purple-950 dark:text-purple-50 col-span-1 sm:col-span-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-purple-700 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                          🟪 Pari Violet (3-4+)
                        </span>
                        <span className="font-extrabold text-xs">
                          <strong className="text-purple-950 dark:text-purple-200">3 plis = 5 pts</strong> &nbsp;|&nbsp; <strong className="text-purple-950 dark:text-purple-200">4 plis ou plus = 10 pts</strong>
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded-full border border-purple-400/50">
                        Objectif Haut
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-2">
                  <h4 className="font-bold text-on-surface flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" /> Les 2 types de Chouines
                  </h4>
                  <ul className="space-y-1.5 text-xs text-on-surface-variant list-disc list-inside">
                    <li>
                      <strong>Chouines Tactiques (0 point) :</strong> Permet de retourner une carte de sa main pendant le jeu. Compabilisé pour l'honneur et le titre de plus grand râleur.
                    </li>
                    <li>
                      <strong>Chouines de Points (+1 point) :</strong> Jouées sur les cartes de réserve. Chaque chouine accorde immédiatement +1 point supplémentaire au score de la manche.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 3. POCKETBASE & SYNCHRO */}
            {activeTab === "sync" && (
              <div className="space-y-3.5">
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-2">
                  <h4 className="font-bold text-on-surface flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-primary" /> Synchronisation Cloud Multi-appareils
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    L'application se connecte au serveur PocketBase (par défaut <code>https://pocketbase.cireaserveur.familyds.com</code>) et enregistre vos profils de Chouineurs ainsi que vos historiques dans la collection dédiée <code>user_data_chouineur</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-on-surface">Étapes pour synchroniser votre smartphone et votre PC :</h5>
                  <ol className="text-xs text-on-surface-variant space-y-2 list-decimal list-inside">
                    <li>
                      Cliquez sur <strong>👤 Mon Compte</strong> en haut à droite.
                    </li>
                    <li>
                      Connectez-vous avec le même e-mail et mot de passe sur les deux appareils.
                    </li>
                    <li>
                      Cliquez sur <strong>« 🔄 Synchroniser avec mon compte maintenant »</strong> sur votre smartphone pour envoyer vos données.
                    </li>
                    <li>
                      Cliquez sur le même bouton sur votre PC : vos joueurs et parties apparaissent immédiatement !
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* 4. CHECKLIST TESTEURS */}
            {activeTab === "tests" && (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant">
                  Voici les scénarios clés à tester lors de votre session d'évaluation :
                </p>

                <div className="space-y-2">
                  {[
                    { title: "Configuration d'équipe", desc: "Créer 3 Chouineurs, changer un avatar par la webcam, choisir des couleurs différentes." },
                    { title: "Saisie d'une manche", desc: "Choisir un pari, incrémenter une chouine tactique et une chouine de points, entrer les plis et valider." },
                    { title: "Validation des paris uniques", desc: "Vérifier que la carte pari réussie en manche 1 est bien marquée comme indisponible en manche 2." },
                    { title: "Terminer une partie (4 manches)", desc: "Compléter les 4 manches et vérifier l'apparition du podium royal et du décompte final." },
                    { title: "Synchronisation Cloud PocketBase", desc: "Se connecter à son compte et synchroniser entre smartphone et PC." },
                    { title: "Bascule Mode Sombre / Clair", desc: "Tester l'icône soleil/lune et s'assurer de la bonne lisibilité de tous les contrastes." }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-xs text-on-surface block">{item.title}</strong>
                        <span className="text-[11px] text-on-surface-variant">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-surface-container border-t border-outline-variant/30 flex justify-between items-center">
            <span className="text-[11px] text-on-surface-variant">
              Fichier complet disponible dans <code>NOTICE_UTILISATION_TESTEURS.md</code>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-xs"
            >
              J'ai compris !
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
