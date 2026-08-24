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
   * Sync user profiles to cloud (if collection 'user_profiles' exists on PocketBase, otherwise fallback gracefully)
   */
  saveUserProfilesToCloud: async (profiles: any[]): Promise<void> => {
    if (!client.authStore.isValid || !client.authStore.record) return;
    const userId = client.authStore.record.id;
    try {
      // Check if user profile container record exists
      let record;
      try {
        record = await client.collection('user_profiles_chouineur').getFirstListItem(`user_id="${userId}"`);
      } catch (e) {
        // Not found
      }

      if (record) {
        await client.collection('user_profiles_chouineur').update(record.id, {
          profiles
        });
      } else {
        await client.collection('user_profiles_chouineur').create({
          user_id: userId,
          profiles
        });
      }
    } catch (err: any) {
      console.warn("Mise à jour des profils cloud PocketBase non disponible:", err?.message || err);
    }
  },

  /**
   * Fetch user profiles from cloud
   */
  getUserProfilesFromCloud: async (): Promise<any[] | null> => {
    if (!client.authStore.isValid || !client.authStore.record) return null;
    const userId = client.authStore.record.id;
    try {
      const record = await client.collection('user_profiles_chouineur').getFirstListItem(`user_id="${userId}"`);
      if (record && Array.isArray(record.profiles)) {
        return record.profiles;
      }
    } catch (e) {
      // Collection or record doesn't exist
    }
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
