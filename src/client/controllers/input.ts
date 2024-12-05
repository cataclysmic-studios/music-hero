import { Controller } from "@flamework/core";
import { UserInputService as UserInput } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { OnInput } from "client/decorators";

import type { ReplicaController } from "./replica";
import type { ScoreController } from "./score";
import type { SongController } from "./song";

/** Handles all game input */
@Controller()
export class InputController implements LogStart {
  public constructor(
    replica: ReplicaController,
    song: SongController,
    private readonly score: ScoreController
  ) {
    UserInput.InputBegan.Connect((input, processed) => {
      if (processed) return;

      const { keybinds } = replica.data;
      if (!keybinds.includes(input.KeyCode.Value)) return;

      const currentSong = song.current();
      if (currentSong === undefined) return;

      const position = <NotePosition>(keybinds.indexOf(input.KeyCode.Value)! + 1);
      this.score.attemptNote(position, currentSong.difficulty);
    });
  }

  @OnInput("Space")
  public activateOverdrive(): void {
    this.score.activateOverdrive();
  }
}