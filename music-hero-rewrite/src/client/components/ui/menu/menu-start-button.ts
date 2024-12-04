import { Component } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import { MenuButton } from "client/base-components/menu-button";
import { SongSelectController } from "client/controllers/song-select";
import { SongController } from "client/controllers/song";
import { ScoreController } from "client/controllers/score";

@Component({
  tag: $nameof<MenuStartButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuStartButton extends MenuButton {
  public constructor(
    private readonly selected: SongSelectController,
    private readonly song: SongController,
    private readonly score: ScoreController
  ) { super(); }

  public onClick(): void {
    if (this.selected.song === undefined) return;
    if (this.selected.difficulty === undefined) return;
    if (this.selected.part === undefined) return;

    this.score.rhythmHUD.enable();
    this.menu.disable();
    this.menu.setPage("Main");
    this.song.set(this.selected.song);
    this.song.setDifficulty(this.selected.difficulty);
    this.song.assignPart(this.selected.part);
    this.song.start();
    this.selected.deselectAll();
  }
}