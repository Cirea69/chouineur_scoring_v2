import { useState, useEffect, FormEvent } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  LogIn,
  UserPlus,
  CheckCircle2,
  Server,
  Cloud,
  CloudOff,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  BookmarkPlus,
  History,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { pb, getPocketBaseUrl, setPocketBaseUrl } from "../lib/pocketbase";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
  onSyncTriggered?: () => Promise<any>;
  syncStats?: {
    countProfiles: number;
    countHistory: number;
    lastSyncTime?: string | null;
  };
  isSyncing?: boolean;
}

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onSyncTriggered,
  syncStats,
  isSyncing = false
}: AccountModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSwitchForm, setShowSwitchForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localSyncing, setLocalSyncing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [runningDiag, setRunningDiag] = useState(false);

  // PocketBase Server URL configuration
  const [serverUrl, setServerUrlState] = useState(getPocketBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowSwitchForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunDiagnostic = async () => {
    setRunningDiag(true);
    setErrorMsg(null);
    try {
      const diag = await pb.testPocketBaseStatus();
      setDiagnosticResult(diag);
    } catch (e: any) {
      setErrorMsg(`Erreur diagnostic: ${e?.message || e}`);
    } finally {
      setRunningDiag(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!onSyncTriggered) return;
    setLocalSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await onSyncTriggered();
      if (res && res.success) {
        const sourceInfo = res.syncSource ? ` (Via ${res.syncSource})` : "";
        const detailInfo = res.details ? `\n• ${res.details}` : "";
        setSuccessMsg((res.message || "Synchronisation réussie !") + sourceInfo + detailInfo);
      } else {
        setSuccessMsg("Synchronisation terminée ! Vos données sont à jour.");
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Erreur de synchronisation.");
    } finally {
      setLocalSyncing(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim()) {
      setErrorMsg("Veuillez remplir l'identifiant et le mot de passe.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await pb.login(identity, password);
      onUserChanged(user);
      setSuccessMsg(`Connexion réussie ! Bienvenue ${user.name || user.email}`);
      if (onSyncTriggered) {
        await onSyncTriggered();
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error("Erreur de connexion PocketBase:", err);
      setErrorMsg(
        err?.message || "Identifiant ou mot de passe incorrect. Vérifiez vos identifiants ou l'URL du serveur PocketBase."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim()) {
      setErrorMsg("Veuillez indiquer un e-mail et un mot de passe.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await pb.register(identity, password, name);
      onUserChanged(user);
      setSuccessMsg(`Compte créé avec succès ! Bienvenue ${user.name || user.email}`);
      setTimeout(() => {
        if (onSyncTriggered) onSyncTriggered();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur de création de compte PocketBase:", err);
      setErrorMsg(
        err?.message || "Échec de la création de compte. Vérifiez si cet e-mail est déjà utilisé."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.logout();
    onUserChanged(null);
    setSuccessMsg("Déconnexion réussie. Vous êtes de retour en mode invité local.");
    setTimeout(() => {
      setSuccessMsg(null);
    }, 2000);
  };

  const handleSaveServerUrl = () => {
    setPocketBaseUrl(serverUrl);
    setSuccessMsg("URL du serveur PocketBase mise à jour !");
    setShowServerConfig(false);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-bright dark:bg-stone-900 border-2 border-outline-variant/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 border border-primary/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-black text-on-surface">
              Espace Compte PocketBase
            </h2>
            <p className="text-xs text-on-surface-variant">
              {currentUser ? "Connecté à PocketBase" : "Mode Invité (Facultatif)"}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGGED IN USER STATE */}
        {currentUser && !showSwitchForm ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Compte actif
                </span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Connecté
                </span>
              </div>
              <p className="font-bold text-sm text-on-surface">
                {currentUser.name || currentUser.username || "Membre Chouineur"}
              </p>
              <p className="text-xs text-on-surface-variant font-mono">{currentUser.email}</p>
            </div>

            {/* Multi-Device Synchronisation Panel */}
            <div className="p-4 bg-surface-container-low border-2 border-primary/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-primary ${localSyncing || isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-black text-on-surface uppercase tracking-wide">
                    Synchronisation Multi-Appareils
                  </span>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Smartphone 📱 ⟷ PC 💻
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-surface-bright dark:bg-stone-800 rounded-lg border border-outline-variant/60">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Chouineurs</p>
                  <p className="text-sm font-black text-primary mt-0.5">
                    {syncStats?.countProfiles ?? 0} enregistrés
                  </p>
                </div>
                <div className="p-2 bg-surface-bright dark:bg-stone-800 rounded-lg border border-outline-variant/60">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Parties Jouées</p>
                  <p className="text-sm font-black text-tertiary mt-0.5">
                    {syncStats?.countHistory ?? 0} dans l'historique
                  </p>
                </div>
              </div>

              {onSyncTriggered && (
                <button
                  type="button"
                  disabled={localSyncing || isSyncing}
                  onClick={handleTriggerSync}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {localSyncing || isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Synchroniser avec mon compte maintenant</span>
                    </>
                  )}
                </button>
              )}

              {/* Diagnostic Button */}
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  disabled={runningDiag}
                  className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {runningDiag ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  <span>Diagnostiquer la connexion PocketBase</span>
                </button>
              </div>

              {/* Diagnostic Results Box */}
              {diagnosticResult && (
                <div className="p-3 bg-surface-bright dark:bg-stone-800 border border-primary/30 rounded-xl text-xs space-y-2 animate-fade-in text-left">
                  <p className="font-extrabold text-[11px] uppercase tracking-wider text-primary flex items-center justify-between">
                    <span>Résultats du Diagnostic</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">{diagnosticResult.url}</span>
                  </p>
                  
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Serveur PocketBase en ligne :</span>
                      <span className={diagnosticResult.isOnline ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                        {diagnosticResult.isOnline ? "✅ Accessible" : "❌ Inaccessible"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Authentification utilisateur :</span>
                      <span className={diagnosticResult.isLoggedIn ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {diagnosticResult.isLoggedIn ? `✅ ${diagnosticResult.userEmail}` : "⚠️ Non connecté"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Collection {diagnosticResult.collectionName} :</span>
                      <span className={diagnosticResult.canRead ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {diagnosticResult.canRead ? "✅ Droits OK" : "⚠️ Accès restreint (Vérifier API Rules)"}
                      </span>
                    </div>
                  </div>

                  {diagnosticResult.errorDetail && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                      💡 {diagnosticResult.errorDetail}
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-on-surface-variant text-center italic">
                {syncStats?.lastSyncTime
                  ? `Dernière synchro réussie : ${syncStats.lastSyncTime}`
                  : "Cliquez pour récupérer et envoyer vos Chouineurs et parties."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSwitchForm(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Changer de compte</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN STATE (FORM FOR LOGIN / REGISTER) */
          <div className="space-y-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-800/60 border border-stone-300/60 dark:border-stone-700 rounded-xl text-xs text-on-surface-variant flex items-start gap-2.5">
              <CloudOff className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-on-surface">Connexion Compte PocketBase</p>
                <p className="mt-0.5">
                  Saisissez l'e-mail et le mot de passe de votre compte PocketBase pour synchroniser vos profils et parties entre tous vos appareils.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-outline-variant/60">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "login"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se Connecter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "register"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Créer un compte</span>
              </button>
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Nom / Pseudo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant/60" />
                    <input
                      type="text"
                      placeholder="Ex: Chouineur64"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  {mode === "login" ? "E-mail ou Nom d'utilisateur" : "Adresse E-mail"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant/60" />
                  <input
                    type="text"
                    placeholder="votre@email.com ou pseudo"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:outline-hidden focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-on-surface-variant/70 hover:text-on-surface cursor-pointer p-0.5"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "register" && (
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block italic">
                    Au moins 8 caractères.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                ) : mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se Connecter à PocketBase</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon Compte PocketBase</span>
                  </>
                )}
              </button>

              {currentUser && showSwitchForm && (
                <button
                  type="button"
                  onClick={() => setShowSwitchForm(false)}
                  className="w-full py-2 text-center text-xs text-on-surface-variant hover:text-on-surface underline cursor-pointer"
                >
                  Annuler et conserver le compte actif ({currentUser.email})
                </button>
              )}

              <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-on-surface-variant">
                💡 <span className="font-bold text-primary">Note PocketBase :</span> Si vous n'avez pas encore d'utilisateur créé, basculez sur l'onglet <strong>« Créer un compte »</strong> pour enregistrer votre identifiant en quelques secondes.
              </div>
            </form>
          </div>
        )}

        {/* PocketBase Server URL Drawer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/40">
          <button
            type="button"
            onClick={() => setShowServerConfig(!showServerConfig)}
            className="text-[11px] font-bold text-on-surface-variant hover:text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Serveur PocketBase ({serverUrl.replace("https://", "").replace("http://", "")})</span>
          </button>

          {showServerConfig && (
            <div className="mt-3 p-3 bg-surface-container-low border border-outline-variant rounded-xl space-y-2 animate-fade-in">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase">
                URL du serveur PocketBase
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrlState(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-surface-bright border border-outline-variant rounded-lg text-xs font-mono text-on-surface focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg font-bold text-xs cursor-pointer"
                >
                  Valider
                </button>
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  disabled={runningDiag}
                  className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {runningDiag ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  <span>Tester l'état du serveur PocketBase</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
