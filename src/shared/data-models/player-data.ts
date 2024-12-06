import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { SongScoreCard } from "./song-score-card";

export const INITIAL_GLOBAL_DATA: GlobalData = {

};

export interface GlobalData {

}

export const INITIAL_DATA: PlayerData = {
  coins: 25,
  stars: 0,
  diamonds: 0,
  keybinds: [Enum.KeyCode.D.Value, Enum.KeyCode.F.Value, Enum.KeyCode.J.Value, Enum.KeyCode.K.Value, Enum.KeyCode.L.Value],
  songScores: {},
  purchaseHistory: []
};

export interface PlayerData {
  readonly coins: DataType.u32;
  readonly stars: DataType.u32;
  readonly diamonds: DataType.u32;
  readonly keybinds: [Enum.KeyCode["Value"], Enum.KeyCode["Value"], Enum.KeyCode["Value"], Enum.KeyCode["Value"], Enum.KeyCode["Value"]];
  readonly songScores: Partial<Record<SongName, SongScoreCard[]>>;
  readonly purchaseHistory: string[];
}