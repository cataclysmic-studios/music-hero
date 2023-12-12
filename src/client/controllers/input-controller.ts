import { Controller, OnInit } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";

import type { SongController } from "./song-controller";
import Log from "shared/logger";
import { VALID_NOTE_RADIUS } from "shared/constants";

const NOTE_POSITIONS = [-6, -2, 2, 6]; // TODO: new positions array for expert?

@Controller()
export class InputController implements OnInit {
  private readonly context = new InputContext;

  public constructor(
    private readonly song: SongController
  ) {}

  public onInit(): void {
    this.context
      .Bind("D", () => {
        const currentNotes = this.song.noteTrack;
        if (!currentNotes) return;
        this.attemptNote(currentNotes, 1);
      })
      .Bind("F", () => {
        const currentNotes = this.song.noteTrack;
        if (!currentNotes) return;
        this.attemptNote(currentNotes, 2);
      })
      .Bind("J", () => {
        const currentNotes = this.song.noteTrack;
        if (!currentNotes) return;
        this.attemptNote(currentNotes, 3);
      })
      .Bind("K", () => {
        const currentNotes = this.song.noteTrack;
        if (!currentNotes) return;
        this.attemptNote(currentNotes, 4);
      })
  }

  private attemptNote(currentNotes: Model, notePosition: 1 | 2 | 3 | 4) {
    const validPosition = NOTE_POSITIONS[notePosition - 1];
    const pressedNote = this.getNotesInRadius(currentNotes)
      .find(note => note.Position.X === validPosition);

    if (pressedNote) {
      pressedNote.Destroy();
      Log.info("Completed note!");
    }
  }

  private getNotesInRadius(currentNotes: Model) {
    return (<Part[]>currentNotes.GetChildren())
      .filter(note => { return note.Position.Z >= -VALID_NOTE_RADIUS})
      .sort((noteA, noteB) => noteA.Position.Z > noteB.Position.Z);
  }
}