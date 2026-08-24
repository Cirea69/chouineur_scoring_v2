import PocketBase from 'pocketbase';

export interface PlayerState {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  scoreActuel: number;
  scoresParManche: number[];
  chouinages: number;
  chouinagesParManche?: number[];
  chouinesPointsParManche?: number[];
  plisParManche?: number[];
  parisParManche?: string[];
  parissValides?: string[];
  color?: string;
}

export interface GameState {
  players: PlayerState[];
  mancheActuelle: number;
  gameStatus: "saisie" | "termine";
  currentTab: "players" | "lobby" | "game" | "scores";
  hostId: string;
  updatedAt?: number;
}

// In AI Studio / Cloud Run, PocketBase is typically reverse proxied on the same origin / port or via VITE_POCKETBASE_URL.
// We use the pocketbase.cireaserveur.familyds.com server domain provided by the user as the default fallback.
export const getPocketBaseUrl = (): string => {
  return localStorage.getItem("pocketbase_url") || (import.meta as any).env?.VITE_POCKETBASE_URL || "https://pocketbase.cireaserveur.familyds.com";
};

export const setPocketBaseUrl = (url: string): void => {
  let cleanedUrl = url.trim();
  if (cleanedUrl && !cleanedUrl.startsWith("http://") && !cleanedUrl.startsWith("https://")) {
    cleanedUrl = "https://" + cleanedUrl;
  }
  localStorage.setItem("pocketbase_url", cleanedUrl);
  client.baseUrl = cleanedUrl;
};

export const client = new PocketBase(getPocketBaseUrl());

export const pb = {
  /**
   * Auth methods
   */
  isLoggedIn: (): boolean => {
    return client.authStore.isValid;
  },

  getCurrentUser: (): any => {
    return client.authStore.record;
  },

  login: async (identity: string, password: string): Promise<any> => {
    const authData = await client.collection('users').authWithPassword(identity, password);
    return authData.record;
  },

  register: async (email: string, password: string, name: string): Promise<any> => {
    // 1. Create user
    await client.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name: name || email.split('@')[0],
    });
    // 2. Auth with password
    const authData = await client.collection('users').authWithPassword(email, password);
    return authData.record;
  },

  logout: (): void => {
    client.authStore.clear();
  },

  onAuthChange: (callback: (record: any) => void): (() => void) => {
    return client.authStore.onChange((token, record) => {
      callback(record);
    });
  },

  /**
   * Comprehensive Cloud Synchronization for all user data (Profiles, History, and Roster)
   * Ensures seamless bi-directional synchronization between Smartphone and PC.
   */
  syncAllUserData: async (localData: {
    profiles: any[];
    history: any[];
    players?: any[];
  }): Promise<{
    success: boolean;
    mergedProfiles: any[];
    mergedHistory: any[];
    countProfiles: number;
    countHistory: number;
    syncSource: string;
    message: string;
    details?: string;
  }> => {
    const user = client.authStore.record;
    const localProfiles = Array.isArray(localData.profiles) ? localData.profiles : [];
    const localHistory = Array.isArray(localData.history) ? localData.history : [];
    const localPlayers = Array.isArray(localData.players) ? localData.players : [];

    let cloudProfiles: any[] = [];
    let cloudHistory: any[] = [];
    let pbSuccess = false;
    let pbDetails = "";
    let syncSource = "Local";

    // 1. Try PocketBase dedicated user_data_chouineur collection
    let pbRecordId: string | null = null;
    let pbTargetCollection = "user_data_chouineur";

    if (client.authStore.isValid && user?.id) {
      // Test collections in order of preference
      const candidateCollections = ['user_data_chouineur', 'user_profiles_chouineur', 'users_data', 'players_scoring'];
      
      for (const col of candidateCollections) {
        try {
          const record = await client.collection(col).getFirstListItem(`user_id="${user.id}"`, { requestKey: null });
          if (record) {
            pbRecordId = record.id;
            pbTargetCollection = col;
            if (Array.isArray(record.profiles) && record.profiles.length > 0) {
              cloudProfiles = record.profiles;
            }
            if (Array.isArray(record.history) && record.history.length > 0) {
              cloudHistory = record.history;
            }
            pbSuccess = true;
            syncSource = `PocketBase (${col})`;
            break;
          }
        } catch (e: any) {
          // If not found (404), maybe the collection exists and we can create later
          if (e?.status === 404) {
            pbTargetCollection = col;
          }
        }
      }
    }

    // 2. Also check /api/user-sync on Express backend (persisted in db.json for bulletproof cross-device sync)
    const syncUserId = user ? (user.id || user.email) : (localStorage.getItem("chouine_client_id") || "guest");
    try {
      const serverRes = await fetch(`/api/user-sync/${encodeURIComponent(syncUserId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      if (serverRes && typeof serverRes === "object") {
        if (Array.isArray(serverRes.profiles) && serverRes.profiles.length > 0) {
          const pMap = new Map();
          cloudProfiles.forEach(p => pMap.set((p.name || "").trim().toLowerCase() || p.id, p));
          serverRes.profiles.forEach((p: any) => {
            const key = (p.name || "").trim().toLowerCase() || p.id;
            if (!pMap.has(key)) pMap.set(key, p);
          });
          cloudProfiles = Array.from(pMap.values());
        }
        if (Array.isArray(serverRes.history) && serverRes.history.length > 0) {
          const hMap = new Map();
          cloudHistory.forEach(h => hMap.set(h.id || (h.date + h.gagnant?.name), h));
          serverRes.history.forEach((h: any) => {
            const key = h.id || (h.date + h.gagnant?.name);
            if (!hMap.has(key)) hMap.set(key, h);
          });
          cloudHistory = Array.from(hMap.values());
        }
        if (syncSource === "Local") syncSource = "Serveur Chouineur";
      }
    } catch (e) {
      console.warn("API server user-sync fetch warning:", e);
    }

    // 3. Merging profiles intelligently (combining local + cloud, no duplicates)
    const profileMap = new Map<string, any>();
    // Insert cloud first, then local (local can update subtitles or avatars)
    cloudProfiles.forEach((p) => {
      const key = (p.name || "").trim().toLowerCase();
      if (key) profileMap.set(key, p);
    });
    localProfiles.forEach((p) => {
      const key = (p.name || "").trim().toLowerCase();
      if (key) {
        const existing = profileMap.get(key);
        profileMap.set(key, { ...existing, ...p });
      }
    });
    const mergedProfiles = Array.from(profileMap.values());

    // 4. Merging history intelligently (combining all unique matches from phone and PC)
    const historyMap = new Map<string, any>();
    cloudHistory.forEach((h) => {
      const key = h.id || `${h.date}_${h.gagnant?.name || ""}_${h.gagnant?.score || 0}`;
      historyMap.set(key, h);
    });
    localHistory.forEach((h) => {
      const key = h.id || `${h.date}_${h.gagnant?.name || ""}_${h.gagnant?.score || 0}`;
      const existing = historyMap.get(key);
      historyMap.set(key, { ...existing, ...h });
    });
    const mergedHistory = Array.from(historyMap.values()).sort((a, b) => {
      // Sort newest first
      return (b.date || "").localeCompare(a.date || "");
    });

    // 5. Push merged state back to PocketBase and Server
    const payload = {
      user_id: user?.id || syncUserId,
      profiles: mergedProfiles,
      history: mergedHistory,
      players: localPlayers,
      updatedAt: Date.now()
    };

    // 5a. Save to PocketBase if user logged in
    if (client.authStore.isValid && user?.id) {
      try {
        if (pbRecordId) {
          await client.collection(pbTargetCollection).update(pbRecordId, payload);
          pbSuccess = true;
        } else {
          try {
            await client.collection(pbTargetCollection).create(payload);
            pbSuccess = true;
          } catch (e: any) {
            // Try fallback collection user_profiles_chouineur
            try {
              await client.collection('user_profiles_chouineur').create({
                user_id: user.id,
                profiles: mergedProfiles,
                history: mergedHistory
              });
              pbSuccess = true;
            } catch (e2: any) {
              pbDetails = `PocketBase: ${e2?.message || e?.message || "Erreur de collection"}`;
              console.warn("PocketBase push warning:", pbDetails);
            }
          }
        }
      } catch (err: any) {
        pbDetails = `PocketBase: ${err?.message || err}`;
        console.warn("PocketBase push error:", pbDetails);
      }
    }

    // 5b. Always save to Express API backend for persistent multi-device sync
    try {
      await fetch(`/api/user-sync/${encodeURIComponent(syncUserId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("API server push warning:", e);
    }

    // Update localStorage cache directly
    localStorage.setItem("chouine_saved_profiles", JSON.stringify(mergedProfiles));
    localStorage.setItem("chouine_historique", JSON.stringify(mergedHistory));
    localStorage.setItem("chouine_last_sync_time", new Date().toISOString());

    return {
      success: true,
      mergedProfiles,
      mergedHistory,
      countProfiles: mergedProfiles.length,
      countHistory: mergedHistory.length,
      syncSource,
      message: `${mergedProfiles.length} Chouineur(s) et ${mergedHistory.length} partie(s) synchronisés avec succès.`,
      details: pbDetails
    };
  },

  /**
   * Sync user profiles to cloud (backward compatibility)
   */
  saveUserProfilesToCloud: async (profiles: any[]): Promise<void> => {
    if (!client.authStore.isValid || !client.authStore.record) return;
    const userId = client.authStore.record.id;
    try {
      let record;
      try {
        record = await client.collection('user_data_chouineur').getFirstListItem(`user_id="${userId}"`);
      } catch (e) {
        try {
          record = await client.collection('user_profiles_chouineur').getFirstListItem(`user_id="${userId}"`);
        } catch (e2) {}
      }

      if (record) {
        await client.collection(record.collectionName || 'user_data_chouineur').update(record.id, { profiles });
      } else {
        await client.collection('user_data_chouineur').create({ user_id: userId, profiles });
      }
    } catch (err: any) {
      console.warn("Mise à jour des profils cloud PocketBase non disponible:", err?.message || err);
    }
  },

  /**
   * Fetch user profiles from cloud (backward compatibility)
   */
  getUserProfilesFromCloud: async (): Promise<any[] | null> => {
    if (!client.authStore.isValid || !client.authStore.record) return null;
    const userId = client.authStore.record.id;
    try {
      let record;
      try {
        record = await client.collection('user_data_chouineur').getFirstListItem(`user_id="${userId}"`);
      } catch (e) {
        try {
          record = await client.collection('user_profiles_chouineur').getFirstListItem(`user_id="${userId}"`);
        } catch (e2) {}
      }
      if (record && Array.isArray(record.profiles)) {
        return record.profiles;
      }
    } catch (e) {}
    return null;
  },

  /**
   * Checks if a room/salon exists on the Pocketbase.
   * Returns its state if it exists, or throws an error.
   */
  getRoom: async (code: string): Promise<GameState> => {
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${code.toUpperCase()}"`);
      return record.state as GameState;
    } catch (err: any) {
      throw new Error(`Le salon ${code.toUpperCase()} n'existe pas ou est indisponible.`);
    }
  },

  /**
   * Host creates or resets a room.
   */
  createRoom: async (code: string, initialState: GameState): Promise<void> => {
    const formattedCode = code.toUpperCase();
    try {
      // Check if already exists
      let record;
      try {
        record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      } catch (e) {
        // Doesn't exist, we will create it
      }

      if (record) {
        // Reset existing room record
        await client.collection('rooms_chouineur').update(record.id, {
          state: initialState
        });
      } else {
        // Create new room record
        await client.collection('rooms_chouineur').create({
          code: formattedCode,
          state: initialState
        });
      }
    } catch (err: any) {
      throw new Error(`Échec de la création du salon : ${err.message || err}`);
    }
  },

  /**
   * Save the global state (Host writes).
   */
  saveRoomState: async (code: string, state: GameState): Promise<void> => {
    const formattedCode = code.toUpperCase();
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      await client.collection('rooms_chouineur').update(record.id, { state });
    } catch (err: any) {
      throw new Error(`Erreur lors de la mise à jour (PocketBase) : ${err.message || err}`);
    }
  },

  /**
   * Join a room (joins the player to the list if not already present).
   */
  joinRoom: async (code: string, player: PlayerState): Promise<GameState> => {
    const formattedCode = code.toUpperCase();
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      const state = record.state as GameState;
      
      if (!state.players) {
        state.players = [];
      }
      
      const exists = state.players.some((p: any) => p.id === player.id);
      if (!exists) {
        // Validation logic for guests joining
        const isGameInProgress = state.currentTab === "game" || state.currentTab === "scores";
        const isLobbyFull = state.players.length >= 5;

        if (isGameInProgress || isLobbyFull) {
          // If the game has started or lobby is full, connect as spectator
          (state as any).isSpectatorOnly = true;
          (state as any).spectatorReason = isGameInProgress ? "game_in_progress" : "lobby_full";
        } else {
          state.players.push(player);
          await client.collection('rooms_chouineur').update(record.id, { state });
        }
      }
      return state;
    } catch (err: any) {
      throw new Error(`Impossible de rejoindre le salon : ${err.message || err}`);
    }
  },

  /**
   * Update a specific player's profile details within the room.
   */
  updatePlayerInRoom: async (code: string, playerId: string, updatedFields: Partial<PlayerState>): Promise<GameState> => {
    const formattedCode = code.toUpperCase();
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      const state = record.state as GameState;
      if (state.players) {
        state.players = state.players.map((p: any) => p.id === playerId ? { ...p, ...updatedFields } : p);
        state.updatedAt = Date.now();
        await client.collection('rooms_chouineur').update(record.id, { state });
      }
      return state;
    } catch (err: any) {
      throw new Error(`Échec de la mise à jour du joueur (PocketBase) : ${err.message || err}`);
    }
  },

  /**
   * Save or update a finished game entry to PocketBase collection history_chouineur.
   */
  saveHistory: async (entry: any): Promise<void> => {
    try {
      let existingRecord: any = null;
      try {
        existingRecord = await client.collection('history_chouineur').getFirstListItem(`history_id="${entry.id}"`);
      } catch (e) {
        // Record not found yet
      }

      const payload = {
        history_id: entry.id,
        date: entry.date,
        gagnant: entry.gagnant,
        perdants: entry.perdants,
        detailsJoueurs: entry.detailsJoueurs,
        isShared: entry.isShared ?? true,
      };

      if (existingRecord) {
        await client.collection('history_chouineur').update(existingRecord.id, payload);
      } else {
        await client.collection('history_chouineur').create(payload);
      }
    } catch (err: any) {
      console.warn("Saving to PocketBase history_chouineur failed:", err?.message || err);
    }
  },

  /**
   * Fetch all saved game entries from PocketBase collection history_chouineur.
   */
  getHistory: async (): Promise<any[]> => {
    try {
      const timeoutPromise = new Promise<any[]>((resolve) =>
        setTimeout(() => resolve([]), 1500)
      );
      const fetchPromise = client
        .collection('history_chouineur')
        .getFullList({ sort: '-created', requestKey: null })
        .then((records: any[]) =>
          records.map((r: any) => ({
            id: r.history_id || r.id,
            date: r.date,
            gagnant: r.gagnant,
            perdants: r.perdants,
            detailsJoueurs: r.detailsJoueurs,
            isShared: r.isShared ?? true,
          }))
        )
        .catch(() => []);

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err: any) {
      return [];
    }
  },

  /**
   * Delete a saved game entry from PocketBase collection history_chouineur.
   */
  deleteHistory: async (id: string): Promise<void> => {
    try {
      const record = await client.collection('history_chouineur').getFirstListItem(`history_id="${id}"`);
      if (record) {
        await client.collection('history_chouineur').delete(record.id);
      }
    } catch (err: any) {
      console.warn("Delete from PocketBase history_chouineur failed:", err);
    }
  },

  /**
   * Subscribe to real-time snapshot modifications of the room document list using real PocketBase subscription.
   * Returns a cleanup function to unsubscribe.
   */
  onSnapshot: (code: string, callback: (data: GameState) => void): (() => void) => {
    const formattedCode = code.toUpperCase();
    let isCancelled = false;

    // Fetch initial state
    const fetchInitial = async () => {
      try {
        const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
        if (record && record.state && !isCancelled) {
          callback(record.state as GameState);
        }
      } catch (e) {
        // Not found or not created yet
      }
    };
    fetchInitial();

    // Subscribe to updates using PocketBase collection real-time channel
    const subscribeToCollection = async () => {
      try {
        await client.collection('rooms_chouineur').subscribe('*', (e) => {
          if (isCancelled) return;
          if (e.record && e.record.code === formattedCode && e.record.state) {
            callback(e.record.state as GameState);
          }
        });
      } catch (err) {
        console.warn("Échec de la souscription temps-réel PocketBase, nouvelle tentative...", err);
        if (!isCancelled) {
          setTimeout(subscribeToCollection, 3000);
        }
      }
    };

    subscribeToCollection();

    return () => {
      isCancelled = true;
      client.collection('rooms_chouineur').unsubscribe('*').catch(() => {});
    };
  },

  /**
   * Subscribe to real-time snapshot modifications of history_chouineur collection.
   */
  onHistorySnapshot: (callback: () => void): (() => void) => {
    let isCancelled = false;

    const subscribeToHistory = async () => {
      try {
        await client.collection('history_chouineur').subscribe('*', () => {
          if (!isCancelled) {
            callback();
          }
        });
      } catch (err) {
        console.warn("Échec de la souscription temps-réel history_chouineur:", err);
      }
    };

    subscribeToHistory();

    return () => {
      isCancelled = true;
      client.collection('history_chouineur').unsubscribe('*').catch(() => {});
    };
  }
};
