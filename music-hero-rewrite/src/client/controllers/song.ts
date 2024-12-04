import { Controller, type OnRender } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import { atom } from "@rbxts/charm";

import { Assets } from "shared/constants";
import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import Log from "shared/log";

import type { BeatController } from "./beat";
import type { ScoreController } from "./score";

@Controller()
export class SongController implements OnRender {
  public readonly part = atom<keyof SongParts>("Lead");
  public difficulty = SongDifficulty.Expert;

  private readonly songJanitor = new Janitor;
  private elapsed = 0;

  public constructor(
    private readonly beatController: BeatController,
    private readonly score: ScoreController
  ) { }

  public onRender(dt: number): void {
    const rhythmBoard = this.score.rhythmHUD.getBoard();
    if (!this.beatController.active || rhythmBoard === undefined) return;

    rhythmBoard.update(this.elapsed);
    this.elapsed += dt;
  }

  public async start(): Promise<void> {
    await this.playIntroMetronome();
    this.beatController.start(() => this.cleanup());
  }

  public set(songName: SongName): void {
    const rhythmBoard = this.score.rhythmHUD.getBoard();
    this.score.setSong(songName);
    this.beatController.currentSong = this.getSongInfo(songName);
    rhythmBoard.beatDuration = this.beatController.getBeatDuration();
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
    this.assignPart(this.part());
  }

  public assignPart(partName: keyof SongParts): void {
    const difficultyName = this.getDifficultyName();
    const songParts = this.beatController.currentSong!.Instance.Parts;
    const noteTrack = this.songJanitor.Add(songParts[difficultyName][partName].Clone());
    const rhythmBoard = this.score.rhythmHUD.getBoard();

    rhythmBoard.setNoteTrack(noteTrack);
    this.score.setTotalNotes(noteTrack.GetChildren().size());
    this.part(partName);
  }

  public getCurrentNoteTrack(): Maybe<Model> {
    return this.score.rhythmHUD?.getBoard().noteTrack;
  }

  private async playIntroMetronome(): Promise<void> {
    const beatDuration = this.beatController.getBeatDuration();
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

  private getSongInfo(songName: SongName): SongInfo {
    const song = Assets.Songs[songName];
    const tempo = song.GetAttribute<number>("Tempo")!;

    return {
      Instance: song,
      Tempo: tempo
    };
  }

  private cleanup(): void {
    Log.info("Cleaned up song");
    this.songJanitor.Cleanup();
    this.beatController.stop();
    this.elapsed = 0;
  }

  private getDifficultyName(): keyof typeof SongDifficulty {
    return <keyof typeof SongDifficulty>SongDifficulty[this.difficulty];
  }
}