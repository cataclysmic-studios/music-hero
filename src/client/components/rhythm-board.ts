import { Component, BaseComponent } from "@flamework/components";

import { VALID_NOTE_RADIUS } from "shared/constants";
import Log from "shared/logger";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = 0 + VALID_NOTE_RADIUS;

@Component({ tag: "RhythmBoard" })
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  public beatDuration = 0;
  public noteTrack?: Model;
  private defaultNoteTrackPivot?: CFrame;

  public setNoteTrack(noteTrack: Model): void {
    this.instance.Parent?.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.instance.Parent;
    this.defaultNoteTrackPivot = noteTrack.GetPivot();
    this.noteTrack = noteTrack;
  }

  public update(elapsed: number): void {
    const lerpPosition = (elapsed / this.beatDuration) * BEAT_STUD_LENGTH;
    this.instance.Grid.OffsetStudsV = lerpPosition;
    this.noteTrack!.PivotTo(this.defaultNoteTrackPivot!.add(new Vector3(0, 0, lerpPosition)));

    for (const note of <MeshPart[]>this.noteTrack!.GetChildren())
      task.spawn(() => {
        if (note.Position.Z >= NOTE_COMPLETION_POSITION) {
          Log.info("Failed note!");
          note.Destroy();
        }
      });
  }
}