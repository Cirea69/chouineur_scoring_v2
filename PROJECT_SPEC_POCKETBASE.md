# Spécifications Techniques : Projet Multi-Chouineurs (React + PocketBase)

Ce document récapitule l'architecture, la structure de la base de données et les snippets de code essentiels pour la mise en œuvre de votre futur projet de jeu de société connecté.

---

## 1. Architecture Globale
Le projet utilisera une architecture moderne de type **SPA (Single Page Application)** connectée à une instance **PocketBase** auto-hébergée.

* **Frontend :** React 18+ (Vite) + Tailwind CSS + Lucide React
* **Backend / Base de données :** PocketBase (Base de données relationnelle légère tout-en-un avec API Temps Réel intégrée)
* **Temps Réel :** Server-Sent Events (SSE) natif de PocketBase (pas besoin de configurer WebSockets)

---

## 2. Incontournable 1 : Mode Clair / Sombre (Light & Dark Mode)
Pour une transition fluide sans scintillement, le mode sombre utilise la classe `.dark` de Tailwind CSS, mémorisée dans le stockage local (`localStorage`).

### Configuration Tailwind (`tailwind.config.js` ou `vite.config.ts`) :
Le sélecteur de mode sombre doit être configuré sur `class` :
```js
module.exports = {
  darkMode: 'class',
  // ... reste de la config
}
```

### Hook React personnalisé (`useDarkMode.ts`) :
```typescript
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  return { theme, toggleTheme, isDark: theme === "dark" };
}
```

---

## 3. Incontournable 2 : Connexion Dynamique au Serveur PocketBase
Pour permettre à l'utilisateur de changer l'adresse IP ou l'URL de PocketBase directement depuis l'interface (ex: passer d'un serveur local `localhost:8090` à un serveur en ligne `https://mon-pocketbase.app`).

### Classe d'initialisation dynamique (`pocketbase.ts`) :
```typescript
import PocketBase from "pocketbase";

const DEFAULT_URL = "http://127.0.0.1:8090";

export function getPocketBaseUrl(): string {
  return localStorage.getItem("pocketbase_url") || DEFAULT_URL;
}

export function savePocketBaseUrl(url: string) {
  localStorage.setItem("pocketbase_url", url);
  // Recharger la page pour réinitialiser le client PocketBase avec la nouvelle URL
  window.location.reload();
}

// Instance globale du SDK PocketBase
export const pb = new PocketBase(getPocketBaseUrl());
```

---

## 4. Incontournable 3 & 4 : Création du Salon, Synchronisation des Invités et Personnalisation des Avatars
Le Maître du Jeu (GM) crée un salon. Les invités rejoignent via un code unique. PocketBase synchronise automatiquement les changements d'avatars et de pseudos en temps réel.

### Schéma de Base de Données PocketBase (Collections recommandées)

#### Collection : `rooms` (Salons)
* `id` : ID unique (ex: `a1b2c3d4e5`)
* `code` : Texte (ex: `CHOU-4322`, code de salon court et lisible)
* `status` : Choix (Ex: `waiting` (attente), `playing` (en cours), `finished` (terminé))
* `game_master_id` : Texte (ID du client qui a créé le salon)
* `current_dealer` : Texte (ID du joueur qui distribue)
* `settings` : JSON (ex: configurations de règles de jeu, points cibles...)

#### Collection : `players` (Joueurs connectés au salon)
* `id` : ID unique du client (généré au hasard ou via session)
* `room_id` : Relation -> `rooms` (indexé pour recherche rapide)
* `name` : Texte (Pseudo)
* `avatar` : Texte (Code ou URL de l'avatar choisi par l'invité)
* `color` : Texte (Hex ou identifiant couleur du joueur)
* `is_ready` : Booléen
* `score_actuel` : Nombre (0 par défaut)
* `chouinages` : Nombre (0 par défaut)

---

### Code Frontend : Cycle de vie temps réel (SSE PocketBase)

Voici comment synchroniser automatiquement l'état du salon et de ses joueurs.

```typescript
import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  is_ready: boolean;
}

interface Room {
  id: string;
  code: string;
  status: "waiting" | "playing" | "finished";
  game_master_id: string;
}

export function useLobby(roomCode: string, currentPlayerId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    // 1. Récupérer le salon d'abord
    pb.collection("rooms").getFirstListItem(`code="${roomCode}"`)
      .then((roomRecord) => {
        setRoom(roomRecord as any);

        // Récupérer la liste des joueurs actuellement connectés au salon
        return pb.collection("players").getFullList({
          filter: `room_id="${roomRecord.id}"`,
        });
      })
      .then((playerRecords) => {
        setPlayers(playerRecords as any);
      })
      .catch(console.error);

    // 2. S'abonner aux changements du salon (Temps Réel)
    pb.collection("rooms").subscribe("*", (e) => {
      if (e.action === "update" && e.record.code === roomCode) {
        setRoom(e.record as any);
      }
    });

    // 3. S'abonner aux changements des joueurs (ex: changement d'avatar d'un invité)
    pb.collection("players").subscribe("*", (e) => {
      // Si un joueur se connecte, se déconnecte ou modifie son profil
      if (e.action === "create") {
        setPlayers((prev) => {
          if (prev.some(p => p.id === e.record.id)) return prev;
          return [...prev, e.record as any];
        });
      } else if (e.action === "update") {
        setPlayers((prev) =>
          prev.map((p) => (p.id === e.record.id ? (e.record as any) : p))
        );
      } else if (e.action === "delete") {
        setPlayers((prev) => prev.filter((p) => p.id !== e.record.id));
      }
    });

    // Nettoyage de la souscription lors du démontage du composant
    return () => {
      pb.collection("rooms").unsubscribe("*");
      pb.collection("players").unsubscribe("*");
    };
  }, [roomCode]);

  // Fonction permettant à l'invité de mettre à jour ses propres données (pseudo, avatar, couleur)
  const updateMyProfile = async (updates: Partial<Player>) => {
    // Si la partie a déjà commencé (status !== "waiting"), bloquer la modification
    if (room?.status !== "waiting") {
      console.warn("Modification impossible : la partie a déjà commencé !");
      return;
    }
    
    try {
      await pb.collection("players").update(currentPlayerId, updates);
    } catch (err) {
      console.error("Erreur de mise à jour de l'avatar/pseudo :", err);
    }
  };

  return { room, players, updateMyProfile };
}
```

---

## 5. Incontournable 5 : Historique des parties & Statistiques dans PocketBase

Pour conserver l'historique de chaque partie de manière robuste, nous créons deux tables d'archivage.

#### Collection : `game_history` (Parties jouées)
* `id` : ID unique
* `date_fin` : Date/Heure (Automatique)
* `duree_secondes` : Nombre
* `total_manches` : Nombre
* `vainqueur_name` : Texte (Pour affichage rapide sans jointure complexe)

#### Collection : `game_player_stats` (Statistiques détaillées par joueur pour chaque partie)
* `id` : ID unique
* `history_id` : Relation -> `game_history` (Pour lier les joueurs à la bonne partie)
* `player_name` : Texte (Pseudo)
* `score` : Nombre
* `chouinages` : Nombre
* `rang` : Nombre (1 pour le premier, 2 pour le second, etc.)
* `reussites` : JSON ou Nombre (Nombre de paris réussis, taux de réussite)

### Enregistrement d'une partie terminée :
```typescript
export async function saveGameToHistory(players: Player[], durationSeconds: number, totalRounds: number) {
  // 1. Déterminer le vainqueur (le joueur qui a le score le plus élevé)
  const sorted = [...players].sort((a, b) => b.score_actuel - a.score_actuel);
  const winner = sorted[0];

  try {
    // 2. Créer l'entrée d'historique principal
    const historyRecord = await pb.collection("game_history").create({
      date_fin: new Date().toISOString(),
      duree_secondes: durationSeconds,
      total_manches: totalRounds,
      vainqueur_name: winner.name,
    });

    // 3. Créer l'entrée des statistiques individuelles de chaque joueur de la partie
    const statsPromises = players.map((player, idx) => {
      // Trouver le rang du joueur
      const rank = sorted.findIndex(p => p.id === player.id) + 1;

      return pb.collection("game_player_stats").create({
        history_id: historyRecord.id,
        player_name: player.name,
        score: player.score_actuel,
        chouinages: player.chouinages,
        rang: rank,
      });
    });

    await Promise.all(statsPromises);
    console.log("Historique de partie enregistré avec succès dans PocketBase !");
  } catch (err) {
    console.error("Erreur lors de l'enregistrement de l'historique :", err);
  }
}
```

---

## 6. Écran de Configuration des Joueurs (En local ou Avant-Match)
Une page unifiée pour configurer les profils des joueurs locaux ou inviter des membres en ligne.

### Composant de Configuration Individuelle (`PlayerConfigForm.tsx`) :
```typescript
import React from "react";
import { User, Palette } from "lucide-react";

// Liste d'avatars prédéfinis ludiques
const AVATAR_LIST = ["🤖", "🦊", "🦁", "🦉", "🐸", "🐹", "🐼", "🐲", "🚀", "🍕"];
// Liste de couleurs d'accentuation
const COLOR_LIST = [
  { id: "red", hex: "#ef4444", bgClass: "bg-red-500" },
  { id: "blue", hex: "#3b82f6", bgClass: "bg-blue-500" },
  { id: "green", hex: "#22c55e", bgClass: "bg-green-500" },
  { id: "amber", hex: "#f59e0b", bgClass: "bg-amber-500" },
  { id: "purple", hex: "#a855f7", bgClass: "bg-purple-500" },
];

interface PlayerConfigProps {
  name: string;
  avatar: string;
  colorId: string;
  onUpdate: (updates: { name?: string; avatar?: string; color?: string }) => void;
  isLocked: boolean; // True si la partie a commencé pour éviter les changements en plein jeu
}

export const PlayerConfigForm: React.FC<PlayerConfigProps> = ({
  name,
  avatar,
  colorId,
  onUpdate,
  isLocked
}) => {
  return (
    <div className="p-4 bg-surface-container rounded-2xl border-2 border-outline/20 space-y-4">
      {/* Saisie du Nom */}
      <div>
        <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
          <User className="w-3.5 h-3.5" /> PSEUDO DU CHOUINEUR
        </label>
        <input
          type="text"
          value={name}
          disabled={isLocked}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-surface py-2 px-3 rounded-lg border-2 border-outline-variant focus:border-primary text-sm font-black disabled:opacity-60"
          placeholder="Ex: Chouineur Pro"
        />
      </div>

      {/* Sélection de l'avatar */}
      <div>
        <span className="text-xs font-bold text-on-surface-variant block mb-1">CHOIX DE L'AVATAR</span>
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_LIST.map((av) => (
            <button
              key={av}
              disabled={isLocked}
              onClick={() => onUpdate({ avatar: av })}
              className={`w-9 h-9 text-lg rounded-lg border-2 transition-all flex items-center justify-center ${
                avatar === av
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-outline-variant hover:bg-black/5 dark:hover:bg-white/5"
              } disabled:opacity-50`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection de la couleur */}
      <div>
        <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
          <Palette className="w-3.5 h-3.5" /> COULEUR D'AFFICHAGE
        </span>
        <div className="flex gap-2">
          {COLOR_LIST.map((col) => (
            <button
              key={col.id}
              disabled={isLocked}
              onClick={() => onUpdate({ color: col.id })}
              className={`w-7 h-7 rounded-full ${col.bgClass} border-2 relative transition-all ${
                colorId === col.id
                  ? "border-on-surface scale-110 ring-2 ring-primary/40"
                  : "border-transparent hover:scale-105"
              } disabled:opacity-50`}
            >
              {colorId === col.id && (
                <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Résumé des Avantages de cette Solution PocketBase

1. **Pas de WebSocket à administrer** : Le SDK PocketBase utilise les Server-Sent Events (SSE) natifs. L'écoute du temps réel s'effectue en une seule ligne de code : `pb.collection('rooms').subscribe(...)`.
2. **Léger et Auto-Hébergeable** : PocketBase est compilé en un seul fichier exécutable en Go (avec SQLite embarqué). Il consomme extrêmement peu de ressources RAM/CPU, ce qui est parfait pour un hébergement sur un petit serveur VPS ou Raspberry Pi.
3. **Sécurité native (Rules/Politiques d'accès API)** : Vous pouvez définir les permissions directement dans la console PocketBase (ex: *"Seul le joueur ayant créé la table peut changer son statut"*).
4. **Facilité d'export / Import** : L'historique et les statistiques sont stockés dans des tables structurées faciles à requêter en SQL pour afficher des graphiques de progression (taux de victoires, nombre de chouinages moyens par joueur, etc.).
