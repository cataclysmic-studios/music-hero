import type { DataType } from "@rbxts/flamework-binary-serializer";

export interface SongScoreCard {
  readonly score: DataType.u32;
  readonly goodNotes: DataType.u16;
  readonly perfectNotes: DataType.u16;
  readonly missedNotes: DataType.u16;
}