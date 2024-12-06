import { Component, BaseComponent } from "@flamework/components";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { SpawnTask } from "shared/decorators";
import { PlayerGui } from "client/utility";
import { Song } from "client/classes/song";
import { VALID_NOTE_RADIUS } from "shared/constants";

import type { ScoreController } from "client/controllers/score";
import type { SongController } from "client/controllers/song";
import { OnRender } from "@flamework/core";

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = VALID_NOTE_RADIUS / 1.5;
const NORMAL_NOTE_COLOR = Color3.fromRGB(102, 125, 188);

@Component({
  tag: $nameof<RhythmBoard>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> implements OnRender {
  private readonly viewport = <ViewportFrame>this.instance.Parent;
  private defaultNoteTrackPivot?: CFrame;

  public constructor(
    private readonly score: ScoreController,
    private readonly song: SongController
  ) {
    super();
    subscribe(song.current, song => {
      if (song === undefined) return;
      this.initializeNoteTrack(song.noteTrack);
    });
  }

  public onRender(): void {
    const song = this.song.current();
    if (song === undefined) return;
    if (this.defaultNoteTrackPivot === undefined) return;

    const timePosition = song.getTimePosition();
    const lerpPosition = (timePosition / song.beatDuration) * BEAT_STUD_LENGTH;
    this.instance.Grid.OffsetStudsV = lerpPosition;
    song.noteTrack.PivotTo(this.defaultNoteTrackPivot.add(new Vector3(0, 0, lerpPosition - 0.5)));
    this.checkForCompletedNotes();
  }

  private initializeNoteTrack(noteTrack: Model): void {
    this.viewport.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.viewport;

    this.defaultNoteTrackPivot = noteTrack.GetPivot();
  }

  @SpawnTask()
  private checkForCompletedNotes(): void {
    const song = this.song.current();
    if (song === undefined) return;

    const notesToBeCompleted = getDescendantsOfType(song.noteTrack, "MeshPart")
      .filter(note => note.Position.Z < NOTE_COMPLETION_POSITION);

    for (const note of notesToBeCompleted) {
      this.score.addFailedNote();
      this.resetOverdrive(note);
      note.Destroy();
    }
  }

  @SpawnTask()
  private resetOverdrive(note: MeshPart): void {
    const overdriveGroup = note.Parent;
    if (overdriveGroup === undefined) return;
    if (!overdriveGroup.IsA("Folder")) return;

    for (const otherNote of <Part[]>overdriveGroup.GetChildren()) {
      otherNote.Color = NORMAL_NOTE_COLOR;
      otherNote.Parent = overdriveGroup.Parent;
    }
    overdriveGroup.Destroy();
  }
}