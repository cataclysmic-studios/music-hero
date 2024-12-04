import { Controller, OnStart, type OnRender } from "@flamework/core";
import type { Components } from "@flamework/components";
import { CollectionService, StarterGui, SoundService as Sound } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import { atom } from "@rbxts/charm";

import { Assets } from "shared/constants";
import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import Log from "shared/log";

import type { RhythmBoard } from "client/components/rhythm-board";
import type { BeatController } from "./beat";
import type { ScoreController } from "./score";
import { PlayerGui } from "client/utility";
import { RhythmHUD } from "client/components/ui/rhythm-hud";

@Controller()
export class SongController implements OnStart, OnRender {
  public difficulty = SongDifficulty.Expert;

  private readonly songJanitor = new Janitor;
  private rhythmBoard!: RhythmBoard;
  private part = atom<keyof SongParts>("Lead");
  private elapsed = 0;

  public constructor(
    private readonly components: Components,
    private readonly beatController: BeatController,
    private readonly score: ScoreController
  ) { }

  public async onStart(): Promise<void> {
    this.rhythmBoard = (await this.components.waitForComponent<RhythmHUD>(PlayerGui.WaitForChild("RhythmHUD"))).getBoard();
  }

  public onRender(dt: number): void {
    if (!this.beatController.active || this.rhythmBoard === undefined) return;

    this.rhythmBoard.update(this.elapsed);
    this.elapsed += dt;
  }

  public async start(): Promise<void> {
    await this.playIntroMetronome();
    this.beatController.start(() => this.cleanup());
  }

  public set(songName: SongName): void {
    this.score.setSong(songName);
    this.beatController.currentSong = this.getSongInfo(songName);
    this.rhythmBoard.beatDuration = this.beatController.getBeatDuration();
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
    this.assignPart(this.part());
  }

  public assignPart(partName: keyof SongParts): void {
    const difficultyName = this.getDifficultyName();
    const songParts = this.beatController.currentSong!.Instance.Parts;
    const noteTrack = this.songJanitor.Add(songParts[difficultyName][partName].Clone());

    this.rhythmBoard.setNoteTrack(noteTrack);
    this.score.setTotalNotes(noteTrack.GetChildren().size());
    this.part(partName);
  }

  public getCurrentNoteTrack(): Maybe<Model> {
    return this.rhythmBoard?.noteTrack;
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