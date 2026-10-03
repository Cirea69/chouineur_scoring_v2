import { useState, useEffect, useRef } from "react";
import { Player, Game, HistoriquePartie, Theme, SavedProfile } from "./types";
import TopAppBar from "./components/TopAppBar";
import BottomNavBar from "./components/BottomNavBar";
import JoueursView from "./components/JoueursView";
import SalonView from "./components/SalonView";
import PartieView from "./components/PartieView";
import ScoresView from "./components/ScoresView";
import SettingsDialog from "./components/SettingsDialog";
import PwaInstallDialog from "./components/PwaInstallDialog";
import AccountModal from "./components/AccountModal";
import NoticeModal from "./components/NoticeModal";
import { pb, client } from "./lib/pocketbase";

// Les fameux avatars originaux des Chouineurs maquettés !
const DEFAULT_PLAYERS: Player[] = [
  {
    id: "gaston-1",
    name: "Gaston",
    subtitle: "Râleur professionnel breveté d'État.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGY42fDNuQddskreOTIgO7_XPft3cj97rlzHtVS0y02gB3CxMbr98Epq5Epa87QPf0TtCDloxMPHAa_d2C2LYdFGf10Itl5BXetv_JDzCPaBR-U3ZC4C5nLnSFFV7NwpaxkWl0DwcpiZvWAqm9eEUavpvx2GsWGvFD7wYGehn-j29ggvIoIfqHenKPEFNag2bwPazWP85fVCJNQ_UOQB6D4qKkZ_P6dBgyVIX0tZOgUysoCMt9MPyW7yXrgfNxQguXX-YlB_-xTs",
    scoreActuel: 11,
    scoresParManche: [11],
    chouinages: 1,
    chouinagesParManche: [0], // 0 whine of card rotation
    chouinesPointsParManche: [1], // 1 point card whine
    plisParManche: [4],
    parisParManche: ["violet"],
    parissValides: ["violet"],
    color: "amber"
  },
  {
    id: "simone-2",
    name: "Simone",
    subtitle: "Aime contester chaque décompte de plis.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnk8Ha798S8MA_B7ljt0VskTJn9n76Foh8XMAR3sIdvSTtGLnUKfoAzCnQwIfzokrcTyRFgA96mpFnW-YYwjfCePGIqXhHHZEbTPDLaBuDF_uhzojcItf6n7Vcrferi6Vb7YFy76hfZ5_QLXwzRpmUGdHM3XN0q2YkY1nuxOOFvgN3fnEZxF_fyI5l9oHmym8EMcPMXwmhWaNcPvsHgNcGWfsOpFk6sSApmsPU6OJSj3PzaWMDWBw8WtKQohJI-a_BLYMABIXJQIE",
    scoreActuel: 8,
    scoresParManche: [8],
    chouinages: 0,
    chouinagesParManche: [0],
    chouinesPointsParManche: [0],
    plisParManche: [1],
    parisParManche: ["verte"],
    parissValides: ["verte"],
    color: "blue"
  },
  {
    id: "balthazar-3",
    name: "Balthazar",
    subtitle: "Chouine même en menant largement au score.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpOSNS863E9dVIAc_SuQxjIr1kZBqheibyx5k67M5IvxaXzQx7nEFI0bTXUx5XuBXbyBb31l_xqE5-J7NUeC3oJjNpIthXuKlqvCpCgdFG4Ev2FnjFDGHAjXPHp1Yv_sds1UfUJQvONHK9UDKalagzE2Zvt2dcTerGh7YC58q6YHydxaXvxHUsXYW_CM8X7_6L7yF3kzGXfgxeNOWSVbbfO_8aYyVpNIHRebjiZr9jfBgxW8moSvM9SIW4lKPcCyxsBzu_xmoZB2Q",
    scoreActuel: 11,
    scoresParManche: [11],
    chouinages: 2,
    chouinagesParManche: [0],
    chouinesPointsParManche: [2],
    plisParManche: [3],
    parisParManche: ["bleu"],
    parissValides: ["bleu"],
    color: "emerald"
  }
];

const LOBBY_SIM_PLAYERS: Player[] = [
  {
    id: "dede-4",
    name: "Dédé",
    subtitle: "Prétend que mélanger les cartes porte la guigne.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ3HDElYtzKIsx0bx5ytEK53j4DreEHwQS9Tb_XcgbjVlRsLXrDIkckxyvVzrhNw8_7csiOBH0O8m5_ZstNycIXxdeT4pOYYIAmmh24FLbw_NLKZxTzGmquaMx0lxUq_jiE5EqiipT2ZAEBRna8qQo_viR8CCENbD0ZsC26Lr_fZ97cCR4kMdesmcJhb9k2SYQR112T3iUaPjbty42W_27O6Ke0xyuhXdRQ9TRghpr0AYQrEPzM08eUN6TquSnGde4Imyo6i9BT4c",
    scoreActuel: 0,
    scoresParManche: [],
    chouinages: 0,
    chouinagesParManche: [],
    chouinesPointsParManche: [],
    plisParManche: [],
    parisParManche: [],
    parissValides: [],
    color: "rose"
  },
  {
    id: "decker-5",
    name: "Reine Decker",
    subtitle: "Exige que les pions soient alignés parfaitement.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpd7v3Tj_4ilCSfRdW_SLvBDfUrcDZVcObXfRm-CvoSgpKV5JybL8pPPFZN6tHSemVQWGIMXd17fcWgWQo-3Y3UZnnmjxXJ_qaBRSIwhr6NT3KK7CMwta9nd_8ppbnPGhAs9vt3Y8NTIW8JnSpK2cW4Hmyd_KIizs_hBRU-uWjbACVQ-Zk2Fbj-zU-lImkyKc8BozqP0GvSepSyg9hsZB90onKf5hOWeGN7kHdVT8EPHXJKsL8MI7NCNz-MkVzVJGbmzohmU-CBkk",
    scoreActuel: 0,
    scoresParManche: [],
    chouinages: 0,
    chouinagesParManche: [],
    chouinesPointsParManche: [],
    plisParManche: [],
    parisParManche: [],
    parissValides: [],
    color: "purple"
  }
];

export default function App() {
  // 1. Initialiser le thème
  const [theme, setTheme] = useState<Theme>(() => {
    const cached = localStorage.getItem("chouine_theme");
    return (cached as Theme) || "light";
  });

  // 2. Initialiser les joueurs
  const [players, setPlayers] = useState<Player[]>(() => {
    const cached = localStorage.getItem("chouine_players");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Échec du chargement des joueurs", e);
      }
    }
    return DEFAULT_PLAYERS;
  });

  // Reference for local conflict resolution to track when state is modified locally
  const lastLocalUpdateTimeRef = useRef<number>(0);
  const markLocalChange = () => {
    lastLocalUpdateTimeRef.current = Date.now();
  };

  const playersRef = useRef<Player[]>(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // 3. Initialiser les paramètres de jeu (fixé à 4 manches selon les règles de Chouine)
  const [maxRounds] = useState<number>(4);

  const [mancheActuelle, setMancheActuelle] = useState<number>(() => {
    const cached = localStorage.getItem("chouine_manche_actuelle");
    return cached ? parseInt(cached, 10) : 2; // Commencer à la manche 2 pour correspondre à "Manche 2" de la maquette d'origine !
  });

  const [gameStatus, setGameStatus] = useState<"saisie" | "termine">(() => {
    const cached = localStorage.getItem("chouine_game_status");
    return (cached as "saisie" | "termine") || "saisie";
  });

  // 4. Initialiser l'historique
  const [historique, setHistorique] = useState<HistoriquePartie[]>(() => {
    const cached = localStorage.getItem("chouine_historique");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "hist-1",
        date: "Hier",
        gagnant: { name: "Balthazar", score: 68 },
        perdants: [
          { name: "Gaston", score: 45 },
          { name: "Simone", score: 32 }
        ]
      }
    ];
  });

  // 4b. Initialiser les profils favoris (Chouineurs enregistrés)
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
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZNvniEMANB7oOLI39p7aqpV6uNbkuiE_MtYMHqm1KB3PNatlWSO3H8tdRY23ghZTbTsGkxi3L0gSZDHK1xqd1lS_blQ6Z_eCKjLCXD8m7aA--eJVVydz843HrHoepqeQsU_5B0YZxWKehx8yyKuBtlZ8_Tl-Juye_SkjsbOO24HxokhqFSqyqVh3zzt393qgtWH4C55C4LFVAwUNfuSBDhnDe9fKLJuLfDTGfp8HCx-Or4zC702U3VR2_I34sVLwJTUfiyFBIB0c",
        color: "amber"
      },
      {
        id: "sp-2",
        name: "Gaston",
        subtitle: "Râle dès qu'il pioche une mauvaise carte.",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1utXBxP-J5exPJaUjKEgRFjZbIZfVKBClrhy-f8QPtTmjNtVGpL-SsveOU-bEseJdPHRZLgpNIUZMUk0nTQvvLCcohKKCgzcEUev2cpEPfiK_TRPptVba0VJ0BCj_bxZZPGINpAwdtBEK1AptqKmnXES11w83Q59hw3uMXrht3vhMS8n9btXfitsGEV9-BdMYnM0Li--EHaRYu9_7TPnxJbCg8rhoiMxhjQgONTn7RJ3EkuvJwjkIborF9-LGcemfGO7YTZ6OTrg",
        color: "emerald"
      },
      {
        id: "sp-3",
        name: "Simone",
        subtitle: "Boude silencieusement quand elle perd.",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaJRKZ4qEJjyYEGZPqFnaIb7zUW3TN__o-cpgGc5Vrk11CMRolIcTpJ9mm-q_wNekoMy-xMMVyrpqfLc8-xqSohG758MMaTUgOAzvxs5e4s3eyolmGzRVqWdxKsdtv1YztFdWL-AdmXwmf5e-G3-Jlw-GBIEHM8bt90wgGv4h0XyOssqI_cZcsoHIQr5vMz-GrlC29BgJCQ1xO6eDlnTlMDPdROphYcg3XaxBVeVLiqmximajl2cxYjDuqTARkv68cblGVh2ASfzo",
        color: "rose"
      }
    ];
  });

  const handleUpdateSavedProfiles = (newProfiles: SavedProfile[]) => {
    setSavedProfiles(newProfiles);
    localStorage.setItem("chouine_saved_profiles", JSON.stringify(newProfiles));
    if (currentUser || pb.isLoggedIn()) {
      pb.syncAllUserData({
        profiles: newProfiles,
        history: historique,
        players
      }).catch((e) => console.warn("Sync update profile warning:", e));
    }
  };

  // 5. Interface UI active et dialogs
  const [currentTab, setCurrentTab] = useState<"players" | "lobby" | "game" | "scores">("players");

  const handleTabChange = (tab: "players" | "lobby" | "game" | "scores") => {
    if (tab === "game" || tab === "scores") {
      if (players.length < 3) {
        alert("La Chouine se joue à 3 joueurs minimum. Veuillez configurer au moins 3 joueurs !");
        return;
      }
      if (players.length > 5) {
        alert("La Chouine se joue à 5 joueurs maximum. Veuillez configurer au maximum 5 joueurs !");
        return;
      }
    }
    markLocalChange();
    setCurrentTab(tab);
  };

  const handleUpdatePlayers = (newPlayers: Player[]) => {
    markLocalChange();
    setPlayers(newPlayers);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => pb.getCurrentUser());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    const t = localStorage.getItem("chouine_last_sync_time");
    return t ? new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
  });

  // Listen to PocketBase Auth changes
  useEffect(() => {
    const unsubscribe = pb.onAuthChange((userRecord) => {
      setCurrentUser(userRecord);
    });
    return () => unsubscribe();
  }, []);

  // Multi-Device Cloud sync handler (Both Profiles and Game History)
  const handleSyncCloudData = async () => {
    setIsSyncing(true);
    try {
      const res = await pb.syncAllUserData({
        profiles: savedProfiles,
        history: historique,
        players: players
      });

      if (res.mergedProfiles && Array.isArray(res.mergedProfiles)) {
        setSavedProfiles(res.mergedProfiles);
      }
      if (res.mergedHistory && Array.isArray(res.mergedHistory)) {
        setHistorique(res.mergedHistory);
      }
      const formattedTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setLastSyncTime(formattedTime);
      return res;
    } catch (e: any) {
      console.warn("Échec de la synchronisation cloud:", e);
      return {
        success: false,
        message: e?.message || "Erreur de connexion lors de la synchronisation.",
        countProfiles: savedProfiles.length,
        countHistory: historique.length
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync automatically when user connects or loads
  useEffect(() => {
    if (currentUser || pb.isLoggedIn()) {
      handleSyncCloudData();
    }
  }, [currentUser]);

  const [multiplayerMode, setMultiplayerMode] = useState<"local" | "simulated" | "multiplayer">(() => {
    const cached = localStorage.getItem("chouine_multiplayer_mode");
    return (cached as "local" | "simulated" | "multiplayer") || "local";
  });

  const [isGM, setIsGM] = useState<boolean>(() => {
    const cached = localStorage.getItem("chouine_is_gm");
    return cached === null ? true : cached === "true";
  });

  const [roomCode, setRoomCode] = useState<string | null>(() => {
    return localStorage.getItem("chouine_room_code") || null;
  });

  const [clientId] = useState<string>(() => {
    const cached = localStorage.getItem("chouine_client_id");
    if (cached) return cached;
    const newId = "client-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("chouine_client_id", newId);
    return newId;
  });

  const [isSpectator, setIsSpectator] = useState<boolean>(() => {
    return localStorage.getItem("chouine_is_spectator") === "true";
  });

  // Progressive Web App (PWA) installation state management
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    return window.matchMedia("(display-mode: standalone)").matches || 
           (window.navigator as any).standalone === true;
  });
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallInstructions(true);
    }
  };

  // Local storage caching for multiplayer configuration
  useEffect(() => {
    localStorage.setItem("chouine_multiplayer_mode", multiplayerMode);
  }, [multiplayerMode]);

  useEffect(() => {
    localStorage.setItem("chouine_is_gm", isGM ? "true" : "false");
  }, [isGM]);

  useEffect(() => {
    localStorage.setItem("chouine_is_spectator", isSpectator ? "true" : "false");
  }, [isSpectator]);

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem("chouine_room_code", roomCode);
    } else {
      localStorage.removeItem("chouine_room_code");
    }
  }, [roomCode]);

  // Host a room
  const handleCreateOnlineRoom = async () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    try {
      await pb.createRoom(code, {
        players,
        mancheActuelle,
        gameStatus,
        currentTab,
        hostId: clientId,
      });
      setIsGM(true);
      setRoomCode(code);
      setMultiplayerMode("multiplayer");
      alert(`Salon ${code} hébergé avec succès ! Partagez ce code avec vos amis.`);
    } catch (err: any) {
      alert("Échec de la création du salon en ligne : " + err.message);
    }
  };

  const handleUpdateMultiplayerModeWithSideEffects = async (mode: "local" | "simulated" | "multiplayer") => {
    setMultiplayerMode(mode);
    
    if (mode === "local" || mode === "simulated") {
      setCurrentTab("players");
    } else if (mode === "multiplayer") {
      setCurrentTab("lobby");
    }
  };

  // Join an existing room
  const handleJoinOnlineRoom = async (code: string, playerName: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      alert("Veuillez saisir un code à 4 lettres.");
      return;
    }
    if (!playerName.trim()) {
      alert("Veuillez saisir un nom ou pseudo.");
      return;
    }

    try {
      // Create new player state for Joining client
      const joiner: Player = {
        id: clientId,
        name: playerName,
        subtitle: "Joueur Distant connecté.",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpOSNS863E9dVIAc_SuQxjIr1kZBqheibyx5k67M5IvxaXzQx7nEFI0bTXUx5XuBXbyBb31l_xqE5-J7NUeC3oJjNpIthXuKlqvCpCgdFG4Ev2FnjFDGHAjXPHp1Yv_sds1UfUJQvONHK9UDKalagzE2Zvt2dcTerGh7YC58q6YHydxaXvxHUsXYW_CM8X7_6L7yF3kzGXfgxeNOWSVbbfO_8aYyVpNIHRebjiZr9jfBgxW8moSvM9SIW4lKPcCyxsBzu_xmoZB2Q",
        scoreActuel: 0,
        scoresParManche: [],
        chouinages: 0,
        chouinagesParManche: [],
        chouinesPointsParManche: [],
        plisParManche: [],
        parisParManche: [],
        parissValides: [],
        color: "purple"
      };

      const serverState = await pb.joinRoom(cleanCode, joiner);
      setIsGM(false);
      setRoomCode(cleanCode);
      setMultiplayerMode("multiplayer");

      const isSpectatorOnly = !!(serverState as any).isSpectatorOnly;
      setIsSpectator(isSpectatorOnly);

      if (isSpectatorOnly) {
        const reason = (serverState as any).spectatorReason;
        if (reason === "game_in_progress") {
          alert("La partie de Chouine a déjà démarré ! Vous rejoignez le salon en tant que SPECTATEUR.");
        } else {
          alert("Le salon est complet (max 5 joueurs) ! Vous rejoignez le salon en tant que SPECTATEUR.");
        }
      } else {
        alert(`Vous avez rejoint le salon ${cleanCode} avec succès !`);
      }
      
      // Seed initial local status
      setPlayers(serverState.players);
      setMancheActuelle(serverState.mancheActuelle);
      setGameStatus(serverState.gameStatus);
      setCurrentTab(serverState.currentTab);
      
    } catch (err: any) {
      alert(err.message || "Impossible de rejoindre le salon.");
    }
  };

  const handleDisconnectRoom = async () => {
    const formerRoomCode = roomCode;
    const pId = clientId;
    const wasHost = isGM;
    const wasMultiplayer = multiplayerMode === "multiplayer";

    setMultiplayerMode("local");
    setRoomCode(null);
    setIsGM(true);
    setIsSpectator(false);
    setPlayers(DEFAULT_PLAYERS);
    setMancheActuelle(2); // Match Chouine maquette default starting round (Manche 2)
    setGameStatus("saisie");
    setCurrentTab("players");

    if (wasMultiplayer && formerRoomCode) {
      try {
        if (!wasHost) {
          // Si invité, se retirer proprement du salon
          const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formerRoomCode.toUpperCase()}"`);
          if (record && record.state) {
            const gameState = record.state as any;
            if (gameState.players) {
              gameState.players = gameState.players.filter((p: any) => p.id !== pId);
              gameState.updatedAt = Date.now();
              await client.collection('rooms_chouineur').update(record.id, { state: gameState });
            }
          }
        }
      } catch (e) {
        console.error("Erreur lors du retrait de l'invité du salon:", e);
      }
    }
    alert("Déconnecté du salon multijoueur. Roster local restauré.");
  };

  // Effet GM (Écriture de l'état global du jeu dans un document pocketbase)
  useEffect(() => {
    if (multiplayerMode === "multiplayer" && isGM && roomCode) {
      const delayDebounce = setTimeout(async () => {
        try {
          await pb.saveRoomState(roomCode, {
            players,
            mancheActuelle,
            gameStatus,
            currentTab,
            hostId: clientId,
            updatedAt: lastLocalUpdateTimeRef.current,
          });
        } catch (err) {
          console.error("Échec de la synchronisation GM vers le serveur:", err);
        }
      }, 80);

      return () => clearTimeout(delayDebounce);
    }
  }, [multiplayerMode, isGM, roomCode, players, mancheActuelle, gameStatus, currentTab, clientId]);

  // Effet de synchronisation pour les Invités quand ils mettent à jour leur propre profil
  useEffect(() => {
    if (multiplayerMode === "multiplayer" && !isGM && roomCode) {
      const now = Date.now();
      if (now - lastLocalUpdateTimeRef.current < 5000) {
        const delayDebounce = setTimeout(async () => {
          try {
            const myPlayer = players.find((p) => p.id === clientId);
            if (myPlayer) {
              await pb.updatePlayerInRoom(roomCode, clientId, {
                name: myPlayer.name,
                avatar: myPlayer.avatar,
                color: myPlayer.color,
                subtitle: myPlayer.subtitle,
              });
            }
          } catch (err) {
            console.error("Échec de la synchronisation Invité vers le serveur:", err);
          }
        }, 50);

        return () => clearTimeout(delayDebounce);
      }
    }
  }, [multiplayerMode, isGM, roomCode, players, clientId]);

  // Effet de synchronisation temps réel unifié (Spectateurs & Joueurs)
  useEffect(() => {
    if (multiplayerMode === "multiplayer" && roomCode) {
      const unsubscribe = pb.onSnapshot(roomCode, (serverState) => {
        // Résolution de conflits : si un changement local récent est plus récent ou identique au snapshot, on l'ignore.
        if (serverState.updatedAt && serverState.updatedAt <= lastLocalUpdateTimeRef.current) {
          return;
        }

        if (!isGM) {
          // Guests & Spectators always sync everything from the server
          if (serverState.players) {
            setPlayers(serverState.players);
          }
          if (serverState.mancheActuelle) {
            setMancheActuelle(serverState.mancheActuelle);
          }
          if (serverState.gameStatus) {
            setGameStatus(serverState.gameStatus);
          }
          if (serverState.currentTab !== undefined) {
            setCurrentTab(serverState.currentTab);
          }
          // Dynamic auto-detect of spectator state
          const amInPlayers = serverState.players?.some((p: any) => p.id === clientId);
          setIsSpectator(!amInPlayers);
        } else {
          // GM (Host) is the owner of game progress (rounds, tabs, statuses).
          // But GM needs to see newly connected players who join!
          if (serverState.players) {
            const currentPlayers = playersRef.current;
            const localIds = currentPlayers.map(p => p.id);
            const serverIds = serverState.players.map(p => p.id);
            
            // Si le MJ vient de modifier localement l'effectif, on ne recharge pas immédiatement les anciennes données du serveur
            const isJustEditedLocally = (Date.now() - lastLocalUpdateTimeRef.current < 1500);
            
            if (!isJustEditedLocally) {
              // Check if there are players on the server that are not in local list, or if the counts differ
              const hasNewPlayers = serverState.players.some(sp => !localIds.includes(sp.id));
              const hasRemovedPlayers = localIds.some(lid => !serverIds.includes(lid));
              
              if (hasNewPlayers || hasRemovedPlayers || localIds.length !== serverIds.length) {
                setPlayers(serverState.players);
              } else {
                // If the IDs are identical, maybe a connected guest updated their avatar/name/color
                const updated = currentPlayers.map(lp => {
                  const sp = serverState.players.find(p => p.id === lp.id);
                  // Keep local modifications on the GM's own player entry, but pull fresh names of guests!
                  if (sp && lp.id !== clientId) {
                    if (sp.name !== lp.name || sp.avatar !== lp.avatar || sp.color !== lp.color || sp.subtitle !== lp.subtitle) {
                      return { ...lp, name: sp.name, avatar: sp.avatar, color: sp.color, subtitle: sp.subtitle };
                    }
                  }
                  return lp;
                });
                if (JSON.stringify(currentPlayers) !== JSON.stringify(updated)) {
                  setPlayers(updated);
                }
              }
            }
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [multiplayerMode, isGM, roomCode, clientId]);

  // Synchroniser le thème avec la balise racine HTML et le body
  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;
    if (theme === "dark") {
      rootEl.classList.add("dark");
      bodyEl.classList.add("dark-mode-state");
    } else {
      rootEl.classList.remove("dark");
      bodyEl.classList.remove("dark-mode-state");
    }
    localStorage.setItem("chouine_theme", theme);
  }, [theme]);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem("chouine_players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("chouine_max_rounds", maxRounds.toString());
  }, [maxRounds]);

  useEffect(() => {
    localStorage.setItem("chouine_manche_actuelle", mancheActuelle.toString());
  }, [mancheActuelle]);

  useEffect(() => {
    localStorage.setItem("chouine_game_status", gameStatus);
  }, [gameStatus]);

  useEffect(() => {
    localStorage.setItem("chouine_historique", JSON.stringify(historique));
  }, [historique]);

  // Restauration de l'historique local uniquement (Solution 1 : confidentialité par défaut)
  useEffect(() => {
    // L'historique local est conservé sur l'appareil dans chouine_historique
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleShareHistoryEntry = async (entryToShare: HistoriquePartie): Promise<boolean> => {
    try {
      const updatedEntry = { ...entryToShare, isShared: true };
      
      // Mettre à jour l'état local immédiatement
      setHistorique((prev) => {
        const exists = prev.some((h) => h.id === entryToShare.id);
        if (exists) {
          return prev.map((h) => (h.id === entryToShare.id ? { ...h, isShared: true } : h));
        } else {
          return [{ ...entryToShare, isShared: true }, ...prev];
        }
      });

      // Enregistrer le score dans la base partagée PocketBase et API Express
      pb.saveHistory(updatedEntry).catch((e) => console.warn("Erreur d'enregistrement PocketBase:", e));

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry)
      });

      return true;
    } catch (e) {
      console.error("Échec du partage de la partie:", e);
      return false;
    }
  };

  const handleUnshareHistoryEntry = async (id: string): Promise<boolean> => {
    try {
      // 1. Mettre à jour l'état local immédiatement (isShared = false)
      setHistorique((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isShared: false } : h))
      );

      // 2. Supprimer de la base partagée API Express et PocketBase
      await fetch(`/api/history/${id}`, {
        method: "DELETE"
      });

      pb.deleteHistory(id).catch((e) => console.warn("Erreur d'annulation PocketBase:", e));

      return true;
    } catch (e) {
      console.error("Échec de l'annulation du partage:", e);
      return false;
    }
  };

  // Actions d'écriture de la manche
  const handleValiderManche = (roundData: {
    [playerId: string]: {
      plis: number;
      pariCardId: string;
      chouinesFlipping: number; // Chouine pour retourner une carte (0 pt)
      chouinesPoints: number; // Chouine de réserve (+1 pt par carte)
      pariPoints: number;
      isPariSuccess: boolean;
      totalScore: number;
    }
  }) => {
    markLocalChange();
    const nextPlayers = players.map((p) => {
      const pData = roundData[p.id] || {
        plis: 0,
        pariCardId: "",
        chouinesFlipping: 0,
        chouinesPoints: 0,
        pariPoints: 0,
        isPariSuccess: false,
        totalScore: 0
      };

      const newScoresParManche = [...p.scoresParManche, pData.totalScore];
      const sum = newScoresParManche.reduce((a, b) => a + b, 0);

      const newChouinagesParManche = [...(p.chouinagesParManche || []), pData.chouinesFlipping];
      const newChouinesPointsParManche = [...(p.chouinesPointsParManche || []), pData.chouinesPoints];
      const newPlisParManche = [...(p.plisParManche || []), pData.plis];
      const newParisParManche = [...(p.parisParManche || []), pData.pariCardId];
      
      const newParissValides = pData.isPariSuccess && pData.pariCardId
        ? [...(p.parissValides || []), pData.pariCardId]
        : (p.parissValides || []);

      return {
        ...p,
        scoresParManche: newScoresParManche,
        scoreActuel: sum,
        chouinages: (p.chouinages || 0) + (pData.chouinesFlipping + pData.chouinesPoints),
        chouinagesParManche: newChouinagesParManche,
        chouinesPointsParManche: newChouinesPointsParManche,
        plisParManche: newPlisParManche,
        parisParManche: newParisParManche,
        parissValides: newParissValides,
      };
    });

    setPlayers(nextPlayers);

    // Vérifier si la partie est terminée
    if (mancheActuelle >= maxRounds) {
      // Trier par ordre décroissant
      const sorted = [...nextPlayers].sort((a, b) => b.scoreActuel - a.scoreActuel);
      const winner = sorted[0];
      const losers = sorted.slice(1).map((lp) => ({ name: lp.name, score: lp.scoreActuel, avatar: lp.avatar }));

      const newHistoryEntry: HistoriquePartie = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        gagnant: { name: winner.name, score: winner.scoreActuel, avatar: winner.avatar },
        perdants: losers,
        detailsJoueurs: nextPlayers.map((p) => ({
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
        isShared: false,
      };

      const updatedHist = [newHistoryEntry, ...historique];
      setHistorique(updatedHist);
      localStorage.setItem("chouine_historique", JSON.stringify(updatedHist));

      // Synchronisation automatique en tâche de fond si connecté
      if (currentUser || pb.isLoggedIn()) {
        pb.syncAllUserData({
          profiles: savedProfiles,
          history: updatedHist,
          players: nextPlayers
        }).catch((err) => console.warn("Background auto sync game warning:", err));
      }

      setGameStatus("termine");
      setMancheActuelle(maxRounds);
      setCurrentTab("scores"); // basculer directement vers le Podium final !
    } else {
      setMancheActuelle((prev) => prev + 1);
      setCurrentTab("scores"); // basculer vers les scores actuels du tour
    }
  };

  const handleStartGame = () => {
    const alreadyHasScore = players.some((p) => p.scoreActuel > 0 || (p.scoresParManche && p.scoresParManche.length > 0));
    if (alreadyHasScore || mancheActuelle > 1 || gameStatus === "termine") {
      if (confirm("Une partie est déjà en cours ou terminée. Voulez-vous démarrer une NOUVELLE partie ? Les scores de la partie en cours seront remis à zéro.")) {
        handleResetGame();
      } else {
        handleTabChange("game");
      }
    } else {
      handleResetGame();
    }
  };

  const handleResetGame = () => {
    markLocalChange();
    const wiped = players.map((p) => ({
      ...p,
      scoreActuel: 0,
      scoresParManche: [],
      chouinages: 0,
      chouinagesParManche: [],
      chouinesPointsParManche: [],
      plisParManche: [],
      parisParManche: [],
      parissValides: []
    }));
    setPlayers(wiped);
    setMancheActuelle(1);
    setGameStatus("saisie");
    setCurrentTab("game");
  };

  const handleResetAll = () => {
    markLocalChange();
    const cleanPlayers = DEFAULT_PLAYERS.map((p) => ({
      ...p,
      scoreActuel: 0,
      scoresParManche: [],
      chouinages: 0,
      chouinagesParManche: [],
      chouinesPointsParManche: [],
      plisParManche: [],
      parisParManche: [],
      parissValides: []
    }));
    setPlayers(cleanPlayers);
    setMancheActuelle(1);
    setGameStatus("saisie");
    setHistorique([]);
    setCurrentTab("players");
    
    // Clear history on database
    fetch("/api/history-clear", {
      method: "POST"
    }).catch((e) => console.warn("Erreur de nettoyage d'historique:", e));
  };

  // Simuler le lobby multijoueur virtuel
  const handleSimulateLobbyPlayers = () => {
    if (players.length >= 5) {
      alert("Le salon royal est plein ! (Maximum de 5 joueurs)");
      return;
    }
    // Essayer de rajouter Dédé ou Decker s'ils n'existent pas encore
    const currentIds = players.map((p) => p.id);
    const availableToInvite = LOBBY_SIM_PLAYERS.filter((p) => !currentIds.includes(p.id));

    if (availableToInvite.length > 0) {
      const inviteTarget = availableToInvite[0];
      setPlayers((prev) => [...prev, inviteTarget]);
    } else {
      // Si déjà invité, simuler des scores pour eux
      alert("Tous les chouineurs distants ont déjà rejoint le salon royal !");
    }
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistorique((prev) => prev.filter((entry) => entry.id !== id));
    
    // Delete log entry on PocketBase & database API
    pb.deleteHistory(id).catch((e) => console.warn("Erreur de suppression PocketBase:", e));
    fetch(`/api/history/${id}`, {
      method: "DELETE"
    }).catch((e) => console.warn("Erreur de suppression du log d'historique:", e));
  };

  // Déterminer le titre du bandeau en haut dynamiquement
  const getRoundLabel = () => {
    if (currentTab === "players") return "Les Chouineurs";
    if (gameStatus === "termine") return "Sacre Royal";
    return `Manche ${mancheActuelle}`;
  };

  return (
    <div className="paper-texture min-h-screen text-on-background pb-32 flex flex-col justify-start select-none transition-colors duration-300">
      {/* 1. Header de navigation bar */}
      <TopAppBar
        roundName={getRoundLabel()}
        theme={theme}
        toggleTheme={toggleTheme}
        openSettings={() => setSettingsOpen(true)}
        openAccount={() => setAccountOpen(true)}
        openNotice={() => setNoticeOpen(true)}
        currentUser={currentUser}
        multiplayerMode={multiplayerMode}
        onUpdateMultiplayerMode={handleUpdateMultiplayerModeWithSideEffects}
        onInstallClick={handleInstallClick}
        isStandalone={isStandalone}
        roomCode={roomCode}
        onDisconnectRoom={handleDisconnectRoom}
      />

      {/* 2. Conteneur principal fluide */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-6 pb-20 relative z-20">
        {currentTab === "players" && (
          <JoueursView
            players={players}
            onUpdatePlayers={handleUpdatePlayers}
            onStartGame={handleStartGame}
            savedProfiles={savedProfiles}
            onUpdateSavedProfiles={handleUpdateSavedProfiles}
            onSyncCloud={handleSyncCloudData}
            currentUser={currentUser}
            isGM={isGM}
            isSpectator={isSpectator}
            multiplayerMode={multiplayerMode}
            onDisconnectRoom={handleDisconnectRoom}
            roomCode={roomCode}
            clientId={clientId}
          />
        )}

        {currentTab === "lobby" && (
          <SalonView
            players={players}
            onUpdatePlayers={handleUpdatePlayers}
            isGM={isGM}
            isSpectator={isSpectator}
            multiplayerMode={multiplayerMode}
            onUpdateMultiplayerMode={handleUpdateMultiplayerModeWithSideEffects}
            onCreateOnlineRoom={handleCreateOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onDisconnectRoom={handleDisconnectRoom}
            roomCode={roomCode}
            clientId={clientId}
            onStartGame={handleStartGame}
          />
        )}

        {currentTab === "game" && (
          <PartieView
            players={players}
            mancheActuelle={mancheActuelle}
            onValiderManche={handleValiderManche}
            onResetGame={handleResetGame}
            isGM={isGM}
            multiplayerMode={multiplayerMode}
          />
        )}

        {currentTab === "scores" && (
          <ScoresView
            players={players}
            status={gameStatus}
            mancheActuelle={mancheActuelle}
            onResetGame={handleResetGame}
            historique={historique}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
            onShareHistoryEntry={handleShareHistoryEntry}
            onUnshareHistoryEntry={handleUnshareHistoryEntry}
            onBackToGame={() => handleTabChange("game")}
            onSyncCloud={handleSyncCloudData}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* 3. Navigation bar du bas */}
      <BottomNavBar currentTab={currentTab} setCurrentTab={handleTabChange} />

      {/* 4. Overlay Dialogue options et paramètres */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxRounds={maxRounds}
        onUpdateMaxRounds={() => {}}
        multiplayerMode={multiplayerMode}
        onUpdateMultiplayerMode={handleUpdateMultiplayerModeWithSideEffects}
        onResetAll={handleResetAll}
        onSimulateLobbyPlayers={handleSimulateLobbyPlayers}
        onOpenNotice={() => setNoticeOpen(true)}
      />

      <PwaInstallDialog
        isOpen={showInstallInstructions}
        onClose={() => setShowInstallInstructions(false)}
        onInstall={handleInstallClick}
        isInstallReady={!!deferredPrompt}
      />

      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        currentUser={currentUser}
        onUserChanged={setCurrentUser}
        onSyncTriggered={handleSyncCloudData}
        syncStats={{
          countProfiles: savedProfiles.length,
          countHistory: historique.length,
          lastSyncTime: lastSyncTime
        }}
        isSyncing={isSyncing}
      />

      <NoticeModal
        isOpen={noticeOpen}
        onClose={() => setNoticeOpen(false)}
      />
    </div>
  );
}
