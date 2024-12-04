import { Controller, type OnRender } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import { atom } from "@rbxts/charm";

import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import { getBeatDuration, getSongInfo } from "shared/game-utility";
import Log from "shared/log";

import { Rhythm } from "./rhythm";
import type { ScoreController } from "./score";
import Signal from "@rbxts/signal";

@Controller()
export class SongController extends Rhythm implements OnRender {
  public readonly updated = new Signal<(elapsed: number) => void>;
  public readonly onSet = new Signal<(song: SongInfo) => void>;
  public readonly noteTrackSet = new Signal<(noteTrack: Model) => void>;
  public readonly part = atom<keyof SongParts>("Lead");
  public difficulty = SongDifficulty.Expert;

  private readonly songJanitor = new Janitor;
  private elapsed = 0;

  public constructor(
    private readonly score: ScoreController
  ) { super(); }

  public onRender(dt: number): void {
    if (!this.active) return;

    this.update(dt);
    this.updated.Fire(this.elapsed);
    this.elapsed += dt;
  }

  public async start(): Promise<void> {
    if (this.currentSong === undefined)
      return Log.warn(`Failed to start song: No song is currently selected`);

    Log.info(`Started song "${this.currentSong.instance.Name}"`);
    await this.playIntroMetronome();
    super.start(this.currentSong.instance.Audio, () => this.cleanup());
  }

  public set(songName: SongName): void {
    this.currentSong = getSongInfo(songName);
    this.score.setSong(songName);
    this.onSet.Fire(this.currentSong);
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
    this.setPart(this.part());
  }

  /**
   * **Note**: `SongController.set()` must be called before this function will work
   */
  public setPart(partName: keyof SongParts): void {
    const difficultyName = this.getDifficultyName();
    const songParts = this.currentSong!.instance.Parts;
    const noteTrack = this.songJanitor.Add(songParts[difficultyName][partName].Clone());

    this.noteTrackSet.Fire(noteTrack);
    this.score.setTotalNotes(noteTrack.GetChildren().size());
    this.part(partName);
  }

  private async playIntroMetronome(): Promise<void> {
    const beatDuration = getBeatDuration(this.currentSong!.tempo);
    Sound.Tick.Play(); // one!
    task.wait(beatDuration * 2);
    Sound.Tick.Play(); // two!
    task.wait(beatDuration * 2);

    Sound.Tick.Play(); // one!
    task.wait(beatDuration);
    Sound.Tick.Play(); // two!
    task.wait(beatDuration);
    Sound.Tick.Play(); // three!
    task.wait(beatDuration);
    Sound.Tick.Play(); // four!
    task.wait(beatDuration);
  }

  private cleanup(): void {
    Log.info("Cleaned up song");
    this.songJanitor.Cleanup();
    this.elapsed = 0;
    this.stop();
  }

  private getDifficultyName(): keyof typeof SongDifficulty {
    return <keyof typeof SongDifficulty>SongDifficulty[this.difficulty];
  }
}
