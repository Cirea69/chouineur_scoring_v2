/**
 * Types globaux pour l'application Chouineurs
 */

export interface Player {
  id: string;
  name: string;
  subtitle: string;
  avatar: string; // URL ou dataURL en base64 de la caméra
  scoreActuel: number;
  scoresParManche: number[];
  chouinages: number; // Nombre de chouinages (+1) effectués
  chouinagesParManche?: number[]; // Chouines pour retourner une carte
  chouinesPointsParManche?: number[]; // Chouines pour 1 point
  plisParManche?: number[];
  parisParManche?: string[];
  parissValides?: string[];
  color?: string; // ID de la couleur choisie (amber, blue, emerald, rose, purple)
}

export interface Game {
  id: string;
  mancheActuelle: number;
  players: Player[];
  status: 'saisie' | 'termine';
  maxRounds: number;
}

export interface HistoriqueJoueurDetail {
  id: string;
  name: string;
  avatar?: string;
  scoreActuel: number;
  chouinages: number;
  scoresParManche?: number[];
  plisParManche?: number[];
  chouinagesParManche?: number[];
  chouinesPointsParManche?: number[];
  parisParManche?: string[];
}

export interface HistoriquePartie {
  id: string;
  date: string;
  gagnant: {
    name: string;
    score: number;
    avatar?: string;
  };
  perdants: {
    name: string;
    score: number;
    avatar?: string;
  }[];
  detailsJoueurs?: HistoriqueJoueurDetail[];
  isShared?: boolean;
}

export interface SavedProfile {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  color?: string;
}

export type Theme = 'light' | 'dark';
