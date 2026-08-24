import { useState, useRef, useEffect } from "react";
import { Sparkles, Settings, Users, Laptop, Download, Server, Database, Check, Loader2, AlertCircle, Smartphone, Wifi, User, ShieldCheck } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Theme } from "../types";
import { getPocketBaseUrl, setPocketBaseUrl } from "../lib/pocketbase";

interface TopAppBarProps {
  roundName: string;
  theme: Theme;
  toggleTheme: () => void;
  openSettings: () => void;
  openAccount: () => void;
  currentUser: any;
  multiplayerMode: "local" | "simulated" | "multiplayer";
  onUpdateMultiplayerMode?: (mode: "local" | "simulated" | "multiplayer") => void;
  onInstallClick: () => void;
  isStandalone: boolean;
  roomCode?: string | null;
  onDisconnectRoom?: () => void;
}

export default function TopAppBar({
  roundName,
  theme,
  toggleTheme,
  openSettings,
  openAccount,
  currentUser,
  multiplayerMode,
  onUpdateMultiplayerMode,
  onInstallClick,
  isStandalone,
  roomCode = null,
  onDisconnectRoom,
}: TopAppBarProps) {
  const [isServerOpen, setIsServerOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => getPocketBaseUrl());
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");
  const serverDropdownRef = useRef<HTMLDivElement>(null);
  const multiplayerDropdownRef = useRef<HTMLDivElement>(null);

  // Sync back when dropdown opens to show exact current state
  useEffect(() => {
    if (isServerOpen) {
      setServerUrl(getPocketBaseUrl());
      setTestStatus("idle");
      setTestError("");
    }
  }, [isServerOpen]);

  // Click outside detection to close the dropdown properly
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        serverDropdownRef.current &&
        !serverDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServerOpen(false);
      }
      if (
        multiplayerDropdownRef.current &&
        !multiplayerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMultiplayerOpen(false);
      }
    }
    if (isServerOpen || isMultiplayerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isServerOpen, isMultiplayerOpen]);

  const handleTestAndSave = async () => {
    if (!serverUrl.trim()) {
      setTestStatus("error");
      setTestError("L'adresse URL ne peut pas être vide.");
      return;
    }

    setTestStatus("loading");
    setTestError("");

    try {
      let formattedUrl = serverUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl;
      }

      // Check basic URL validity
      new URL(formattedUrl);

      // Dynamically load the client's PocketBase class from 'pocketbase' to test
      const PocketBaseClass = (await import("pocketbase")).default;
      const testClient = new PocketBaseClass(formattedUrl);

      // Try checking connectivity with the rooms_chouineur collection list (fetch 1 item)
      await testClient.collection("rooms_chouineur").getList(1, 1, {
        requestKey: null
      });

      // It works! Apply new URL globally and save to localStorage
      setPocketBaseUrl(formattedUrl);
      setServerUrl(formattedUrl);
      setTestStatus("success");

      // Auto-close after a short visual delay
      setTimeout(() => {
        setIsServerOpen(false);
        setTestStatus("idle");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setTestStatus("error");
      
      const errorStr = err?.message || err?.toString() || "";
      if (errorStr.includes("404") || errorStr.includes("not found")) {
        setTestError("URL joignable, mais la collection 'rooms_chouineur' est manquante ou vide.");
      } else {
        setTestError("Impossible de se connecter. Vérifiez l'adresse, l'accès ou la validité SSL.");
      }
    }
  };

  return (
    <header className="w-full top-0 border-b-2 border-on-background/10 dark:border-surface-variant bg-background/95 dark:bg-surface-container-low/95 backdrop-blur-xs sticky z-40 transition-colors shadow-sm">
      {/* Small beautiful retro striped bar mimicking Velonimo & GAP box art */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 h-full bg-[#e14e2c]" />
        <div className="w-1/3 h-full bg-[#f5a623]" />
        <div className="w-1/3 h-full bg-[#1f8373]" />
      </div>
      <div className="flex justify-between items-center px-margin-mobile py-2.5 w-full max-w-7xl mx-auto">
        {/* Left Option */}
        <div className="flex items-center gap-2">
          <div className="p-2 text-primary dark:text-primary-fixed-dim bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-label-md text-xs uppercase tracking-wider hidden sm:inline-block font-bold text-on-surface-variant flex items-center gap-1">
            {multiplayerMode === "local" ? (
              <>
                <Laptop className="w-3 h-3 text-secondary" />
                Local Pass-and-Play
              </>
            ) : multiplayerMode === "simulated" ? (
              <>
                <Users className="w-3 h-3 text-tertiary animate-bounce" />
                Simulateur en ligne
              </>
            ) : (
              <>
                <Users className="w-3 h-3 text-primary animate-pulse" />
                Multi-joueur Réel
              </>
            )}
          </span>
        </div>

        {/* Center Title */}
        <h1 className="font-headline-md text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim transition-colors italic">
          {roundName}
        </h1>

        {/* Right Options */}
        <div className="flex items-center gap-3">
          {!isStandalone && (
            <button
              id="pwa-install-button"
              onClick={onInstallClick}
              className="p-2 text-primary hover:bg-black/5 dark:hover:bg-white/10 dark:text-primary-fixed-dim transition-colors rounded-full active:scale-90 duration-150 flex items-center justify-center cursor-pointer relative"
              title="Installer Chouineurs (PWA)"
            >
              <Download className="w-6 h-6 text-primary dark:text-primary-fixed-dim shrink-0 animate-pulse" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-secondary rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-secondary rounded-full" />
            </button>
          )}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Account Modal Trigger */}
          <button
            onClick={openAccount}
            className={`p-2 transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center cursor-pointer relative ${
              currentUser
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30"
                : "text-primary dark:text-primary-fixed-dim hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title={currentUser ? `Connecté: ${currentUser.name || currentUser.email}` : "Espace Compte PocketBase (Facultatif)"}
          >
            <User className="w-5 h-5" />
            <span
              className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-surface-variant ${
                currentUser ? "bg-emerald-500" : "bg-stone-400"
              }`}
            />
          </button>
          
          {/* Multiplayer Switcher Dropdown */}
          <div className="relative" ref={multiplayerDropdownRef}>
            <button
              onClick={() => setIsMultiplayerOpen(!isMultiplayerOpen)}
              className={`p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center cursor-pointer relative ${
                isMultiplayerOpen ? "text-primary dark:text-primary-fixed-dim bg-black/5 dark:bg-white/10" : "text-primary dark:text-primary-fixed-dim"
              }`}
              title="Sélectionner le Mode Multijoueur"
            >
              {multiplayerMode === "local" ? (
                <Laptop className="w-6 h-6 text-primary dark:text-primary-fixed-dim" />
              ) : multiplayerMode === "simulated" ? (
                <Smartphone className="w-6 h-6 text-[#9c27b0] dark:text-[#ea80fc] animate-pulse" />
              ) : (
                <Wifi className="w-6 h-6 text-green-500 dark:text-green-400 animate-pulse" />
              )}
              {multiplayerMode !== "local" && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-surface-variant flex animate-ping" />
              )}
            </button>

            {isMultiplayerOpen && (
              <div
                className="absolute right-0 mt-3 w-80 bg-background dark:bg-surface-dim hand-drawn-border p-4 rounded-xl z-50 text-left space-y-3"
                style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
              >
                <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
                  <Users className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-xs font-bold text-on-surface">Mode de Jeu Multijoueur</span>
                </div>

                <div className="space-y-1">
                  {/* Option: Local Pass-and-Play */}
                  <button
                    onClick={() => {
                      if (multiplayerMode === "multiplayer" && roomCode) {
                        if (confirm("Voulez-vous quitter le salon multijoueurs pour repasser en Pass-and-Play local ?")) {
                          onDisconnectRoom?.();
                          onUpdateMultiplayerMode?.("local");
                        }
                      } else {
                        onUpdateMultiplayerMode?.("local");
                      }
                      setIsMultiplayerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 transition-all text-xs hover:bg-black/5 dark:hover:bg-white/5 border ${
                      multiplayerMode === "local"
                        ? "border-primary bg-primary/5 text-primary font-bold dark:border-primary-fixed-dim"
                        : "border-transparent text-on-surface"
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm">Pass-and-Play Local</p>
                      <p className="text-[10px] text-on-surface-variant/90 font-normal">Chacun son tour sur le même appareil physique.</p>
                    </div>
                  </button>

                  {/* Option: Simulated online */}
                  <button
                    onClick={() => {
                      if (multiplayerMode === "multiplayer" && roomCode) {
                        if (confirm("Voulez-vous quitter le salon multijoueurs pour utiliser le simulateur ?")) {
                          onDisconnectRoom?.();
                          onUpdateMultiplayerMode?.("simulated");
                        }
                      } else {
                        onUpdateMultiplayerMode?.("simulated");
                      }
                      setIsMultiplayerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 transition-all text-xs hover:bg-black/5 dark:hover:bg-white/5 border ${
                      multiplayerMode === "simulated"
                        ? "border-primary bg-primary/5 text-primary font-bold dark:border-primary-fixed-dim"
                        : "border-transparent text-on-surface"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#9c27b0] dark:text-[#ea80fc] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm">Simulateur en ligne</p>
                      <p className="text-[10px] text-on-surface-variant/90 font-normal">S'entraîner avec un salon virtuel automatisé.</p>
                    </div>
                  </button>

                  {/* Option: Real Multiplayer */}
                  <button
                    onClick={() => {
                      onUpdateMultiplayerMode?.("multiplayer");
                      setIsMultiplayerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 transition-all text-xs hover:bg-black/5 dark:hover:bg-white/5 border ${
                      multiplayerMode === "multiplayer"
                        ? "border-primary bg-primary/5 text-primary font-bold dark:border-primary-fixed-dim"
                        : "border-transparent text-on-surface"
                    }`}
                  >
                    <Wifi className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm">Multi-joueurs Réel</p>
                      <p className="text-[10px] text-on-surface-variant/90 font-normal">Connectez plusieurs téléphones ou tablettes en direct !</p>
                    </div>
                  </button>
                </div>

                {multiplayerMode === "multiplayer" && (
                  <div className="pt-2 border-t border-outline-variant/60 space-y-2">
                    {roomCode ? (
                      <div className="bg-primary/5 dark:bg-primary-fixed-dim/5 p-2 rounded-lg border border-primary/20 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-widest leading-none">CODE DU SALON</span>
                        <span className="font-black tracking-widest text-green-600 dark:text-green-400 text-xl mt-1 select-all">{roomCode}</span>
                        <span className="text-[9px] text-on-surface-variant italic mt-1 leading-tight">Actif & synchronisé en temps réel</span>
                        {onDisconnectRoom && (
                          <button
                            onClick={() => {
                              onDisconnectRoom();
                              setIsMultiplayerOpen(false);
                            }}
                            className="mt-2 w-full py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded hover:shadow duration-100 transition-all select-none cursor-pointer"
                          >
                            Quitter le salon
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-on-surface-variant/90 italic border border-outline-variant/60 bg-black/5 dark:bg-white/5 p-2 rounded-lg text-center">
                        Créez ou rejoignez un salon depuis l'onglet <strong>Joueurs</strong> en bas de l'écran !
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative" ref={serverDropdownRef}>
            <button
              onClick={() => setIsServerOpen(!isServerOpen)}
              className={`p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center cursor-pointer relative ${
                isServerOpen ? "text-primary dark:text-primary-fixed-dim bg-black/5 dark:bg-white/10" : "text-primary dark:text-primary-fixed-dim"
              }`}
              title="Configurer l'adresse du serveur PocketBase"
            >
              <Server className="w-6 h-6 text-primary dark:text-primary-fixed-dim" />
            </button>

            {isServerOpen && (
              <div 
                className="absolute right-0 mt-3 w-80 bg-background dark:bg-surface-dim hand-drawn-border p-4 rounded-xl z-50 text-left space-y-3"
                style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
              >
                <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
                  <Database className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-xs font-bold text-on-surface">Configuration Serveur</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Adresse PocketBase (URL)
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => {
                      setServerUrl(e.target.value);
                      if (testStatus === "error" || testStatus === "success") {
                        setTestStatus("idle");
                      }
                    }}
                    placeholder="https://pocketbase.example.com"
                    className="w-full text-xs font-mono py-2 px-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary-fixed-dim text-on-surface"
                  />
                </div>

                {testStatus === "error" && (
                  <div className="flex gap-1.5 p-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded text-[10px] items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{testError}</span>
                  </div>
                )}

                {testStatus === "success" && (
                  <div className="flex gap-1.5 p-2 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded text-[10px] items-center">
                    <Check className="w-4 h-4 shrink-0 text-green-500" />
                    <span className="font-bold">Connexion réussie & URL sauvegardée !</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsServerOpen(false)}
                    className="flex-1 py-1.5 px-3 border border-outline text-on-surface hover:bg-black/5 dark:hover:bg-white/5 rounded text-xs select-none cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleTestAndSave}
                    disabled={testStatus === "loading"}
                    className="flex-1 py-1.5 px-3 bg-primary text-on-primary hover:opacity-95 dark:bg-primary-fixed-dim dark:text-on-primary rounded text-xs select-none font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {testStatus === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Test...
                      </>
                    ) : (
                      "Sauvegarder"
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-on-surface-variant italic leading-tight text-center">
                  La collection <code className="font-mono bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">rooms_chouineur</code> doit exister sur le serveur de destination.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={openSettings}
            className="p-2 text-primary hover:bg-black/5 dark:hover:bg-white/10 dark:text-primary-fixed-dim transition-colors rounded-full active:rotate-12 active:scale-95 duration-150 flex items-center justify-center cursor-pointer"
            title="Options du jeu"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
