import { Controller, type OnRender } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import { atom } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { Song } from "client/classes/song";
import { SongBuilder } from "client/classes/song-builder";
import Log from "shared/log";

@Controller()
export class SongController implements OnRender {
  public readonly current = atom<Maybe<Song>>(undefined);
  public readonly builder = new SongBuilder;

  public onRender(dt: number): void {
    const song = this.current();
    if (song === undefined) return;
    song.update(dt);
  }

  public resetBuilder(this: Writable<this>): void {
    this.builder.destroy();
    this.builder = new SongBuilder;
  }

  public start(song: Song): void {
    Log.info(`Started song "${song.info.name}"`);
    this.current(song);
    this.playIntroMetronome(song.beatDuration);
    song.start();
  }

  private playIntroMetronome(beatDuration: number): void {
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
