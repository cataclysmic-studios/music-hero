import type { SongScoreCard } from "shared/data-models/song-score-card";

export interface ScoreCardSavePacket {
  readonly songName: SongName;
  readonly scoreCard: SongScoreCard;
}