import Destroyable from "@rbxts/destroyable";

import { getSongInfo } from "shared/game-utility";
import { Song } from "./song";
import type { SongDifficulty } from "shared/structs/song-info";
import Log from "shared/log";

export class SongBuilder extends Destroyable {
  private name?: SongName;
  private difficulty?: SongDifficulty;
  private partName?: keyof SongParts;

  public setName(name: SongName): void {
    this.name = name;
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
  }

  public setPart(partName: keyof SongParts): void {
    this.partName = partName;
  }

  public build(): Song {
    if (this.name === undefined)
      return Log.fatal("Failed to build song: The song has no name");
    if (this.difficulty === undefined)
      return Log.fatal("Failed to build song: The song has no difficulty");
    if (this.partName === undefined)
      return Log.fatal("Failed to build song: The song has no part");

    const songInfo = getSongInfo(this.name);
    return new Song(songInfo, this.difficulty, this.partName);
  }

  public destroy(): void {
    super.destroy();
    this.name = undefined;
    this.difficulty = undefined;
    this.partName = undefined;
  }
}