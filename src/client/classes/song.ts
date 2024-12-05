import Destroyable from "@rbxts/destroyable";
import Signal from "@rbxts/signal";

import { getBeatDuration } from "shared/game-utility";
import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import Log from "shared/log";

export class Song extends Destroyable {
  public readonly onBeat = this.janitor.Add(new Signal, "Destroy");
  public readonly noteTrack: Model;
  public readonly totalNotes: number;
  public readonly beatDuration: number;
  public timePosition = 0;
  public active = false;

  private timeSinceLastBeat = math.huge;

  public constructor(
    public readonly info: SongInfo,
    public readonly difficulty: SongDifficulty,
    public readonly partName: keyof SongParts
  ) {
    super();
    const difficultyName = <keyof typeof SongDifficulty>SongDifficulty[difficulty];
    const songParts = info.instance.Parts;
    this.noteTrack = this.janitor.Add(songParts[difficultyName][partName].Clone());
    this.totalNotes = this.noteTrack.GetChildren().size();
    this.beatDuration = getBeatDuration(info.tempo)
  }

  public async start(): Promise<void> {
    const audio = this.info.instance.Audio;
    this.janitor.Add(audio.Ended.Once(() => this.destroy()));
    this.janitor.Add(audio.Stopped.Once(() => this.destroy()));
    this.active = true;
    audio.Play();
  }

  public destroy(): void {
    super.destroy();
    Log.info("Cleaned up song");
    this.timePosition = 0;
    this.timeSinceLastBeat = math.huge;
    this.active = false;
  }

  public update(dt: number): void {
    if (!this.active) return;
    this.timeSinceLastBeat += dt;

    if (this.timeSinceLastBeat >= this.beatDuration) {
      this.onBeat.Fire();
      this.timeSinceLastBeat -= this.beatDuration;
    }

    this.timePosition += dt;
  }

  public getTimePosition(): number {
    return this.timePosition;
  }
}