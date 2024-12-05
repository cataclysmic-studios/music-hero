import { Controller, type OnRender } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import { atom } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { Song } from "client/classes/song";
import Log from "shared/log";

@Controller()
export class SongController implements OnRender {
  public readonly updated = new Signal<() => void>;
  public readonly current = atom<Maybe<Song>>(undefined);

  public onRender(dt: number): void {
    const song = this.current();
    if (song === undefined) return;
    song.update(dt);
    this.updated.Fire();
  }

  public async start(song: Song): Promise<void> {
    Log.info(`Started song "${song.info.name}"`);
    this.current(song);
    await this.playIntroMetronome(song.beatDuration);
    await song.start();
  }

  private async playIntroMetronome(beatDuration: number): Promise<void> {
    // one, two
    for (let i = 0; i < 2; i++) {
      Sound.Tick.Play();
      task.wait(beatDuration * 2);
    }

    // one, two, three, four!
    for (let i = 0; i < 4; i++) {
      Sound.Tick.Play();
      task.wait(beatDuration);
    }
  }
}
