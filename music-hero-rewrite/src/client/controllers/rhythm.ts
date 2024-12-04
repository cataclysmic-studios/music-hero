import Signal from "@rbxts/signal";

import { getBeatDuration } from "shared/game-utility";
import type { SongInfo } from "shared/structs/song-info";

export class Rhythm {
  public readonly onBeat = new Signal;
  public active = false;

  protected currentSong?: SongInfo;

  private timeSinceLastBeat = 0;

  public update(dt: number): void {
    if (!this.active) return;
    if (this.currentSong === undefined) return;
    this.timeSinceLastBeat += dt;

    const beatDuration = getBeatDuration(this.currentSong.tempo);
    if (this.timeSinceLastBeat >= beatDuration) {
      this.onBeat.Fire();
      this.timeSinceLastBeat -= beatDuration;
    }
  }

  public start(audio: Sound, cleanup: Callback): void {
    let endConn: RBXScriptConnection, stopConn: RBXScriptConnection;
    cleanup = () => {
      endConn.Disconnect();
      stopConn.Disconnect();
      cleanup();
    };

    endConn = audio.Ended.Once(cleanup);
    stopConn = audio.Stopped.Once(cleanup);
    audio.Play();
    this.active = true;
  }

  public stop(): void {
    this.active = false;
  }
}