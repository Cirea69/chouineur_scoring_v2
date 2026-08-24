import { X, Download, Smartphone, Laptop, Settings, ChevronRight, HelpCircle, Share2, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PwaInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallReady: boolean;
}

export default function PwaInstallDialog({
  isOpen,
  onClose,
  onInstall,
  isInstallReady,
}: PwaInstallDialogProps) {
  if (!isOpen) return null;

  // Détecter la plateforme utilisateur pour afficher des conseils sur-mesure
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        {/* Backdrop overlay handler click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          id="pwa-install-dialog"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.23, ease: "easeOut" }}
          className="bg-background dark:bg-stone-900 w-full max-w-md hand-drawn-border p-6 rounded-2xl relative overflow-hidden shadow-2xl z-10"
        >
          {/* Header Banner Background Accents */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-tertiary" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all text-on-surface cursor-pointer active:scale-90"
            title="Fermer"
          >
            <X className="w-5 h-5 font-black" />
          </button>

          {/* Title & Icon container */}
          <div className="flex items-center gap-3.5 mb-5 mt-2">
            <div className="p-3 rounded-xl bg-primary/10 text-primary dark:text-primary-fixed-dim border border-primary/20 flex items-center justify-center">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-headline-sm text-lg sm:text-xl text-primary dark:text-primary-fixed-dim uppercase tracking-wide font-black">
                Installer Chouineurs
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
                Progressive Web App (PWA)
              </p>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            Installez Chouineurs sur votre écran d'accueil pour en profiter instantanément comme une application native : affichage plein écran, lancements plus rapides et consommation minimale de données !
          </p>

          {/* Core dynamic content depending on direct Install availability */}
          {isInstallReady ? (
            <div className="space-y-4 mb-6">
              <div className="bg-primary/5 dark:bg-primary-container/20 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                <CircleDot className="w-5 h-5 text-primary dark:text-primary-fixed-dim shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-primary dark:text-primary-fixed-dim">Prêt pour l'installation rapide</p>
                  <p className="text-on-surface-variant mt-1">Votre navigateur Chrome supporte l'installation directe en un clic.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-sans font-black text-sm bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container hand-drawn-border rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow"
              >
                <Download className="w-4 h-4 shrink-0" />
                INSTALLER L'APPLICATION
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1 border-b pb-1 dark:border-stone-800">
                Comment installer manuellement ?
              </span>

              {isIOS ? (
                // iOS instructions (Safari is the king for PWAs on iPhone)
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">1</span>
                    <p>Ouvrez cette page dans le navigateur <b>Safari</b>.</p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">2</span>
                    <p className="inline flex-wrap items-center gap-1">
                      Appuyez sur le bouton de partage <Share2 className="w-3.5 h-3.5 text-blue-500 inline mx-1 mt-[-2px]" /> en bas (sur iPhone) ou en haut à droite (sur iPad).
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">3</span>
                    <p>Faites défiler les options et choisissez <b className="text-primary dark:text-primary-fixed-dim">« Sur l'écran d'accueil »</b>.</p>
                  </div>
                </div>
              ) : isAndroid ? (
                // Android general manual instructions
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">1</span>
                    <p>Appuyez sur les trois points verticaux <b>(⋮)</b> dans l'angle supérieur droit de Chrome.</p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">2</span>
                    <p>Sélectionnez l'option <b className="text-primary dark:text-primary-fixed-dim">« Installer l'application »</b> ou « Ajouter à l'écran d'accueil ».</p>
                  </div>
                </div>
              ) : (
                // Desktop general instructions
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">1</span>
                    <p>Regardez dans la barre d'adresse de votre navigateur Chrome (à droite).</p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">2</span>
                    <p>Cliquez sur l'icône de téléchargement en forme de petit écran : 🖥️ ou <b>[+]</b>.</p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant leading-relaxed p-2 rounded-lg bg-surface-container-low dark:bg-stone-900/50">
                    <span className="font-mono bg-primary/10 text-primary dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black">3</span>
                    <p>Alternativement, ouvrez le <b>Menu (⋮)</b> et sélectionnez <b>« Installer Chouineurs... »</b>.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer badge status */}
          <div className="flex items-center justify-between border-t border-outline-variant/50 pt-4 text-[10px] text-on-surface-variant/70 font-semibold font-mono">
            <span className="flex items-center gap-1.5 uppercase">
              <Smartphone className="w-3.5 h-3.5 text-secondary" />
              Mobile: &nbsp;{isIOS ? "iOS Safari" : isAndroid ? "Android" : "Compatible"}
            </span>
            <span className="flex items-center gap-1.5 uppercase">
              <Laptop className="w-3.5 h-3.5 text-primary" />
              Desktop: OK
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
