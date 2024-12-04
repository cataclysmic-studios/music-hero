export interface SongInfo {
  readonly instance: SongData;
  readonly tempo: number;
}

export enum SongDifficulty {
  Easy,
  Medium,
  Hard,
  Expert
}