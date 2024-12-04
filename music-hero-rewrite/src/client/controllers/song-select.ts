import { Controller } from "@flamework/core";

import { SongDifficulty } from "shared/structs/song-info";

@Controller()
export class SongSelectController {
  public song?: SongName;
  public difficulty?: SongDifficulty;
  public part?: keyof SongParts;

  public deselectAll(): void {
    this.song = undefined;
    this.difficulty = undefined;
    this.part = undefined;
  }
}