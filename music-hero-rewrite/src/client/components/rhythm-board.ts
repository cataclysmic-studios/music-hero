import { Component, BaseComponent } from "@flamework/components";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";
import { VALID_NOTE_RADIUS } from "shared/constants";

import type { ScoreController } from "client/controllers/score";
import { SongController } from "client/controllers/song";
import { getBeatDuration } from "shared/game-utility";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = 0 + (VALID_NOTE_RADIUS / 1.5);
const OVERDRIVE_NOTE_COLOR = Color3.fromRGB(218, 133, 65);
const NORMAL_NOTE_COLOR = Color3.fromRGB(102, 125, 188);

@Component({
  tag: $nameof<RhythmBoard>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  private readonly viewport = <ViewportFrame>this.instance.Parent;
  private defaultNoteTrackPivot?: CFrame;
  private noteTrack?: Model;
  private beatDuration = 0;

  public constructor(
    private readonly score: ScoreController,
    song: SongController
  ) {
    super();
    song.updated.Connect(elapsed => this.update(elapsed));
    song.onSet.Connect(song => this.beatDuration = getBeatDuration(song.tempo));
    song.noteTrackSet.Connect(noteTrack => this.setNoteTrack(noteTrack));
  }

  private setNoteTrack(noteTrack: Model): void {
    this.viewport.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.viewport;

    this.defaultNoteTrackPivot = noteTrack.GetPivot();
    this.noteTrack = noteTrack;
  }

  private update(elapsed: number): void {
    if (this.noteTrack === undefined) return;
    if (this.defaultNoteTrackPivot === undefined) return;

    const lerpPosition = (elapsed / this.beatDuration) * BEAT_STUD_LENGTH;
    this.instance.Grid.OffsetStudsV = lerpPosition;
    this.noteTrack.PivotTo(this.defaultNoteTrackPivot.add(new Vector3(0, 0, lerpPosition)));

    const allNotes = getDescendantsOfType(this.noteTrack, "MeshPart");
    for (const note of allNotes)
      task.spawn(() => {
        if (note.Position.Z >= NOTE_COMPLETION_POSITION) {
          const noteParent = note.Parent!;
          const noteColor = OVERDRIVE_NOTE_COLOR;
          note.Destroy();
          this.score.addFailedNote();

          if (noteColor === OVERDRIVE_NOTE_COLOR) {
            const overdriveGroup = noteParent;
            if (!overdriveGroup.IsA("Folder")) return;
            for (const otherNote of <Part[]>overdriveGroup.GetChildren()) {
              otherNote.Color = NORMAL_NOTE_COLOR;
              otherNote.Parent = overdriveGroup.Parent;
            }
            overdriveGroup.Destroy();
          }
        }
      });
  }
}