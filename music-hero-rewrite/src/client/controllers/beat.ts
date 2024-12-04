import { Controller, OnRender } from "@flamework/core";
import Signal from "@rbxts/signal";

import type { SongInfo } from "shared/structs/song-info";
import Log from "shared/log";

@Controller()
export class BeatController implements OnRender {
  public readonly onBeat = new Signal;
  public currentSong?: SongInfo;
  public active = false;

  private elapsed = 0;

  public onRender(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;
    const beatDuration = this.getBeatDuration();

    if (this.elapsed >= beatDuration) {
      this.onBeat.Fire();
      this.elapsed -= beatDuration;
    }
  }

  public start(cleanup: Callback): void {
    if (this.currentSong === undefined)
      return Log.warn("Cannot start BeatController: No current song set");

    Log.info(`Started song "${this.currentSong.Instance.Name}" via BeatController`);
    this.currentSong.Instance.Audio.Ended.Once(cleanup);
    task.spawn(() => this.currentSong!.Instance.Audio.Play());
    this.active = true;
  }

  public stop(this: Writable<this>): void {
    this.active = false;
    this.onBeat?.Destroy();
    this.onBeat = new Signal;
  }

  public getBeatDuration(): number {
    return 60 / this.currentSong!.Tempo;
  }
}