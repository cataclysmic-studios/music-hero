export interface SongStats {
  readonly stars: number;
  readonly starsProgress: number,
  readonly points: number;
  readonly goodNotes: number;
  readonly perfectNotes: number;
  readonly missedNotes: number;
  readonly totalNotes: number;
  readonly accuracy: number;
}