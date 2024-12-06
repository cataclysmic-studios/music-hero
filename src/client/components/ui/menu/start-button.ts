import { Component } from "@flamework/components";
import { startsWith } from "@rbxts/string-utils";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";
import Log from "shared/log";

import { RhythmHUD } from "../rhythm-hud";
import { MenuButton } from "client/base-components/menu-button";
import type { SongController } from "client/controllers/song";

@Component({
  tag: $nameof<MenuStartButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuStartButton extends MenuButton implements LogStart {
  public constructor(
    private readonly song: SongController
  ) { super(); }

  protected onClick(): void {
    const song = this.song.builder.tryBuild();
    if (song === undefined) return;

    RhythmHUD.enable();
    this.menu.disable();
    this.menu.setPage("Main");
    this.song.resetBuilder();
    this.song.start(song);
  }
}