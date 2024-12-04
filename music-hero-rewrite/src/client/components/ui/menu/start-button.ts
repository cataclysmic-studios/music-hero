import { Component } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";

import { RhythmHUD } from "../rhythm-hud";
import { MenuButton } from "client/base-components/menu-button";
import type { SongSelectController } from "client/controllers/song-select";
import type { SongController } from "client/controllers/song";
import type { ScoreController } from "client/controllers/score";

@Component({
  tag: $nameof<MenuStartButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuStartButton extends MenuButton implements LogStart {
  public constructor(
    private readonly selected: SongSelectController,
    private readonly song: SongController
  ) { super(); }

  protected onClick(): void {
    if (this.selected.song === undefined) return;
    if (this.selected.difficulty === undefined) return;
    if (this.selected.part === undefined) return;

    RhythmHUD.enable();
    this.menu.disable();
    this.menu.setPage("Main");
    this.song.set(this.selected.song);
    this.song.setDifficulty(this.selected.difficulty);
    this.song.setPart(this.selected.part);
    this.song.start();
    this.selected.deselectAll();
  }
}