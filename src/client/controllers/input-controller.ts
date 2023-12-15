import { Controller, OnInit } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";

import { VALID_NOTE_RADIUS } from "shared/constants";
import Log from "shared/logger";

import type { SongController } from "./song-controller";

const NOTE_WS_POSITIONS = [-6, -2, 2, 6]; // TODO: new positions array for expert?

type NotePosition = 1 | 2 | 3 | 4;

@Controller()
export class InputController implements OnInit {
  private readonly context = new InputContext;

  public constructor(
    private readonly song: SongController
  ) {}

  public onInit(): void {
    this.context
      .Bind("D", () => this.attemptNote(1))
      .Bind("F", () => this.attemptNote(2))
      .Bind("J", () => this.attemptNote(3))
      .Bind("K", () => this.attemptNote(4));
  }

  private attemptNote(notePosition: NotePosition) {
    if (!this.song.getCurrentNoteTrack()) return;
    const [pressedNote] = this.getNotesInRadius(notePosition);
    if (!pressedNote) return;

    pressedNote.Destroy();
    Log.info("Completed note!");
  }

  private getNotesInRadius(notePosition: NotePosition) {
    return this.getNotesInPosition(notePosition)
      .sort((noteA, noteB) => noteA.Position.Z > noteB.Position.Z)
      .filter(note => note.Position.Z > 0 ? note.Position.Z <= VALID_NOTE_RADIUS : note.Position.Z >= -VALID_NOTE_RADIUS);
  }

  private getNotesInPosition(notePosition: NotePosition) {
    const validPosition = NOTE_WS_POSITIONS[notePosition - 1];
    return (<Part[]>this.song.getCurrentNoteTrack()!.GetChildren())
      .filter(note => note.Position.X === validPosition);
  }
}