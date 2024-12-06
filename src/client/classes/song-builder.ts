import Destroyable from "@rbxts/destroyable";

import { Assets } from "shared/constants";
import { Song } from "./song";
import type { SongDifficulty, SongInfo } from "shared/structs/song-info";

function getSongInfo(songName: SongName): SongInfo {
  const song = Assets.Songs.WaitForChild(songName);

  return {
    instance: song,
    name: songName,
    tempo: song.GetAttribute<number>("Tempo")!
  };
}

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

  public tryBuild(): Maybe<Song> {
    if (this.name === undefined) return;
    if (this.difficulty === undefined) return;
    if (this.partName === undefined) return;

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