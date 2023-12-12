import { Controller, OnStart, type OnRender } from "@flamework/core";
import type { Components } from "@flamework/components";
import { CollectionService, StarterGui } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";

import { Assets } from "shared/utilities/helpers";
import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import { VALID_NOTE_RADIUS } from "shared/constants";
import Log from "shared/logger";

import type { RhythmBoard } from "client/components/rhythm-board";
import type { BeatVisualizer } from "client/components/ui/beat-visualizer";
import type { BeatController } from "./beat-controller";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = 0 + VALID_NOTE_RADIUS;

@Controller()
export class SongController implements OnStart, OnRender {
  private readonly songJanitor = new Janitor;

  private elapsed = 0;
  private difficulty = SongDifficulty.Expert;
  private part: keyof SongParts = "Lead";
  private defaultNoteTrackPivot?: CFrame;
  private rhythmBoard?: RhythmBoard;

  public noteTrack?: Model;

  public constructor(
    private readonly components: Components,
    private readonly beatController: BeatController
  ) {}

  public async onStart(): Promise<void> {
    task.wait(5)
    const boardModel = <Part>CollectionService.GetTagged("RhythmBoard").find(instance => !instance.IsDescendantOf(StarterGui));
    this.rhythmBoard = await this.components.waitForComponent<RhythmBoard>(boardModel);

    this.beatController.currentSong = this.getSongInfo("Paradise Falls");
    this.setDifficulty(SongDifficulty.Easy);
    this.assignPart("Drums");

    const beatVisualizerFrame = <Frame>CollectionService.GetTagged("BeatVisualizer").find(instance => !instance.IsDescendantOf(StarterGui));
    const beatVisualizer = await this.components.waitForComponent<BeatVisualizer>(beatVisualizerFrame);
    this.beatController.onBeat.Connect(() => beatVisualizer.visualizeBeat());
    this.beatController.start();
    this.beatController.currentSong?.Instance.Audio.Ended.Once(() => this.cleanup());
  }

  public onRender(dt: number): void {
    if (!this.beatController.active) return;

    this.updateRhythmBoard();
    this.elapsed += dt;
  }

  private updateRhythmBoard(): void {
    const beatDuration = this.beatController.getBeatDuration();
    const lerpPosition = (this.elapsed / beatDuration) * BEAT_STUD_LENGTH;
    this.rhythmBoard!.instance.Grid.OffsetStudsV = lerpPosition;
    this.noteTrack!.PivotTo(this.defaultNoteTrackPivot!.add(new Vector3(0, 0, lerpPosition)));

    task.spawn(() => {
      for (const note of <MeshPart[]>this.noteTrack!.GetChildren())
        if (note.Position.Z >= NOTE_COMPLETION_POSITION) {
          Log.info("Failed note!");
          note.Destroy();
        }
    });
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
    this.assignPart(this.part);
  }

  public assignPart(partName: keyof SongParts): void {
    const difficultyName = this.getDifficultyName();
    const songParts = this.beatController.currentSong!.Instance.Parts;
    this.noteTrack = this.songJanitor.Add(songParts[difficultyName][partName].Clone());
    this.defaultNoteTrackPivot = this.noteTrack.GetPivot();

    Log.info(`Assigned part "${partName}" on "${difficultyName}"`);
    this.rhythmBoard!.setNoteTrack(this.noteTrack);
    this.part = partName;
  }

  public getSongInfo(songName: ExtractKeys<typeof Assets.Songs, SongData>): SongInfo {
    const song = Assets.Songs[songName];
    const tempo = <number>song.GetAttribute("Tempo");

    return {
      Instance: song,
      Tempo: tempo
    };
  }

  private cleanup(): void {
    Log.info("Cleaned up song");
    this.songJanitor.Cleanup();
    this.beatController.stop();
    this.noteTrack = undefined;
  }

  private getDifficultyName(): keyof typeof SongDifficulty {
    return <keyof typeof SongDifficulty>SongDifficulty[this.difficulty];
  }
}