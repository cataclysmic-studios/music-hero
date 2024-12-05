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

const BEAT_STUD_LENGTH = 12;
const NOTE_COMPLETION_POSITION = VALID_NOTE_RADIUS / 1.5;
const NORMAL_NOTE_COLOR = Color3.fromRGB(102, 125, 188);

@Component({
  tag: $nameof<RhythmBoard>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  private readonly viewport = <ViewportFrame>this.instance.Parent;
  private defaultNoteTrackPivot?: CFrame;
  private currentSong?: Song;

  public constructor(
    private readonly score: ScoreController,
    song: SongController
  ) {
    super();
    song.updated.Connect(() => this.update());
    subscribe(song.current, song => {
      this.currentSong = song;
      if (song === undefined) return;
      this.initializeNoteTrack(song.noteTrack);
    });
  }

  private initializeNoteTrack(noteTrack: Model): void {
    this.viewport.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.viewport;

    this.defaultNoteTrackPivot = noteTrack.GetPivot();
  }

  private update(): void {
    if (this.currentSong === undefined) return;
    if (this.defaultNoteTrackPivot === undefined) return;

    const timePosition = this.currentSong.getTimePosition();
    const lerpPosition = (timePosition / this.currentSong.beatDuration) * BEAT_STUD_LENGTH;
    this.instance.Grid.OffsetStudsV = lerpPosition;
    this.currentSong.noteTrack.PivotTo(this.defaultNoteTrackPivot.add(new Vector3(0, 0, lerpPosition - 0.5)));
    this.checkForCompletedNotes();
  }

  private checkForCompletedNotes(): void {
    if (this.currentSong === undefined) return;

    const allNotes = getDescendantsOfType(this.currentSong.noteTrack, "MeshPart");
    for (const note of allNotes)
      task.spawn(() => {
        if (note.Position.Z < NOTE_COMPLETION_POSITION) return;

        this.score.addFailedNote();
        this.resetOverdrive(note);
        note.Destroy();
      });
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