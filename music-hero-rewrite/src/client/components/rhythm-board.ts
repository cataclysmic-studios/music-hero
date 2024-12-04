import { Component, BaseComponent } from "@flamework/components";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";
import { VALID_NOTE_RADIUS } from "shared/constants";

import type { ScoreController } from "client/controllers/score";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = 0 + (VALID_NOTE_RADIUS / 1.5);
const NOTE_WORLD_SPACE_POSITIONS = [-6, -2, 2, 6, 10];
const OVERDRIVE_NOTE_COLOR = Color3.fromRGB(218, 133, 65);
const NORMAL_NOTE_COLOR = Color3.fromRGB(102, 125, 188);

@Component({
  tag: $nameof<RhythmBoard>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  public beatDuration = 0;
  public noteTrack?: Model;
  private defaultNoteTrackPivot?: CFrame;
  private readonly viewport = <ViewportFrame>this.instance.Parent;

  public constructor(
    private readonly score: ScoreController
  ) { super(); }

  public setNoteTrack(noteTrack: Model): void {
    this.viewport.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.viewport;

    this.defaultNoteTrackPivot = noteTrack.GetPivot();
    this.noteTrack = noteTrack;
  }

  public update(elapsed: number): void {
    if (this.noteTrack === undefined) return;
    if (this.defaultNoteTrackPivot === undefined) return;

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

    const lerpPosition = (elapsed / this.beatDuration) * BEAT_STUD_LENGTH;
    this.instance.Grid.OffsetStudsV = lerpPosition;
    this.noteTrack.PivotTo(this.defaultNoteTrackPivot.add(new Vector3(0, 0, lerpPosition)));
  }

  public getNotesInRadius(notePosition: NotePosition): MeshPart[] {
    return this.getNotesInPosition(notePosition)
      .sort((noteA, noteB) => noteA.Position.Z > noteB.Position.Z)
      .filter(note => note.Position.Z > 0 ? note.Position.Z <= VALID_NOTE_RADIUS / 1.5 : note.Position.Z >= -VALID_NOTE_RADIUS)
      .map(note => {
        note.SetAttribute("Completed", true);
        return note;
      });
  }

  public getNotesInPosition(notePosition: NotePosition): MeshPart[] {
    const validPosition = NOTE_WORLD_SPACE_POSITIONS[notePosition - 1];

    return this.getAllNotes()
      .filter(note => note.Position.X === validPosition)
  }

  public getAllNotes(): MeshPart[] {
    if (this.noteTrack === undefined)
      return [];

    return getDescendantsOfType(this.noteTrack, "MeshPart")
      .filter(note => !note.GetAttribute("Completed"));
  }
}