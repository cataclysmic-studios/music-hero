import { Controller, OnStart, type OnRender } from "@flamework/core";
import type { Components } from "@flamework/components";
import { CollectionService, StarterGui } from "@rbxts/services";

import { Assets } from "shared/utilities/helpers";
import { SongDifficulty, type SongInfo } from "shared/structs/song-info";
import Log from "shared/logger";

import type { RhythmBoard } from "client/components/rhythm-board";
import type { BeatVisualizer } from "client/components/ui/beat-visualizer";
import type { BeatController } from "./beat-controller";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = 0;

@Controller()
export class SongController implements OnStart, OnRender {
  private elapsed = 0;
  private difficulty = SongDifficulty.Expert;
  private part: keyof SongParts = "Lead";
  private defaultNoteTrackPivot?: CFrame;
  private rhythmBoard?: RhythmBoard;

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
    const noteTrack = this.assignPart("Drums");
    this.defaultNoteTrackPivot = noteTrack.GetPivot();

    const beatVisualizerFrame = <Frame>CollectionService.GetTagged("BeatVisualizer").find(instance => !instance.IsDescendantOf(StarterGui));
    const beatVisualizer = await this.components.waitForComponent<BeatVisualizer>(beatVisualizerFrame);
    this.beatController.onBeat.Connect(() => beatVisualizer.visualizeBeat());
    task.delay(1, () => this.beatController.start());
  }

  public onRender(dt: number): void {
    if (!this.beatController.active) return;

    this.updateRhythmBoard();
    this.elapsed += dt;
  }

  private updateRhythmBoard() {
    const beatDuration = this.beatController.getBeatDuration();
    const partNotes = <Model>this.rhythmBoard!.instance.Parent!.WaitForChild("Notes");
    const lerpPosition = (this.elapsed / beatDuration) * BEAT_STUD_LENGTH;
    this.rhythmBoard!.instance.Grid.OffsetStudsV = lerpPosition;
    partNotes.PivotTo(this.defaultNoteTrackPivot!.add(new Vector3(0, 0, lerpPosition)));

    task.spawn(() => {
      for (const note of <MeshPart[]>partNotes.GetChildren())
        task.spawn(() => {
          if (note.Position.Z >= NOTE_COMPLETION_POSITION)
            note.Destroy();
        });
    });
  }

  public setDifficulty(difficulty: SongDifficulty): void {
    this.difficulty = difficulty;
    Log.info(`Assigned difficulty "${this.getDifficultyName()}"`);
  }

  public assignPart(partName: keyof SongParts): Model {
    const difficultyName = this.getDifficultyName();
    const songParts = this.beatController.currentSong!.Instance.Parts;
    const partNotes = songParts[difficultyName][partName];

    Log.info(`Assigned part "${partName}"`);
    this.part = partName;
    this.rhythmBoard!.addInstrumentTrack(partNotes);

    return partNotes;
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

  }

  private getDifficultyName(): keyof typeof SongDifficulty {
    return <keyof typeof SongDifficulty>SongDifficulty[this.difficulty];
  }
}