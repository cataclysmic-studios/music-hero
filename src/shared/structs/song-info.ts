export interface SongInfo {
  readonly instance: SongData;
  readonly name: SongName;
  readonly tempo: number;
}

export enum SongDifficulty {
  Easy,
  Medium,
  Hard,
  Expert
}