import { useState, useEffect } from "react";
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
  History
} from "lucide-react";
import { pb, getPocketBaseUrl, setPocketBaseUrl } from "../lib/pocketbase";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
  onSyncTriggered?: () => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onSyncTriggered
}: AccountModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // PocketBase Server URL configuration
  const [serverUrl, setServerUrlState] = useState(getPocketBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
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
      setTimeout(() => {
        if (onSyncTriggered) onSyncTriggered();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur de connexion PocketBase:", err);
      setErrorMsg(
        err?.message || "Identifiant ou mot de passe incorrect. Vérifiez vos identifiants ou l'URL du serveur PocketBase."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
        {currentUser ? (
          <div className="space-y-5">
            <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Compte actif
                </span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Synchro Cloud
                </span>
              </div>
              <p className="font-bold text-sm text-on-surface">
                {currentUser.name || currentUser.username || "Membre Chouineur"}
              </p>
              <p className="text-xs text-on-surface-variant font-mono">{currentUser.email}</p>
            </div>

            <div className="p-4 bg-surface-container-low/70 dark:bg-stone-800/50 border border-outline-variant/60 rounded-xl space-y-2 text-xs text-on-surface-variant">
              <p className="font-bold text-on-surface flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                Avantages de votre connexion :
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Vos profils de joueurs favoris sont synchronisés sur votre compte.</li>
                <li>Vos parties privées sont conservées en sécurité.</li>
                <li>Vous pouvez publier vos plus beaux scores dans l'historique communautaire.</li>
              </ul>
            </div>

            {onSyncTriggered && (
              <button
                type="button"
                onClick={() => {
                  onSyncTriggered();
                  setSuccessMsg("Synchronisation avec PocketBase lancée !");
                  setTimeout(() => setSuccessMsg(null), 2500);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-xl text-xs font-bold text-on-surface transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-primary" />
                <span>Synchroniser mes données maintenant</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter (Revenir en mode local)</span>
            </button>
          </div>
        ) : (
          /* NOT LOGGED IN STATE (FORM FOR LOGIN / REGISTER) */
          <div className="space-y-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-800/60 border border-stone-300/60 dark:border-stone-700 rounded-xl text-xs text-on-surface-variant flex items-start gap-2.5">
              <CloudOff className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-on-surface">Mode Invité (Local)</p>
                <p className="mt-0.5">
                  L'application fonctionne à 100% sans compte ! Connectez-vous uniquement si vous souhaitez sauvegarder vos profils et parties sur PocketBase.
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
                    placeholder="votre@email.com"
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:outline-hidden focus:border-primary"
                  />
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
                    <span>Se Connecter</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon Compte</span>
                  </>
                )}
              </button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
