import { Component } from "@flamework/components";
import { startsWith } from "@rbxts/string-utils";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";
import Log from "shared/log";

import { RhythmHUD } from "../rhythm-hud";
import { MenuButton } from "client/base-components/menu-button";
import type { SongBuilderController } from "client/controllers/song-builder";
import type { SongController } from "client/controllers/song";

@Component({
  tag: $nameof<MenuStartButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuStartButton extends MenuButton implements LogStart {
  public constructor(
    private readonly songBuilder: SongBuilderController,
    private readonly song: SongController
  ) { super(); }

  protected onClick(): void {
    try {
      const song = this.songBuilder.builder.build();
      this.songBuilder.reset();

      RhythmHUD.enable();
      this.menu.disable();
      this.menu.setPage("Main");
      this.song.start(song);
    } catch (e) {
      if (startsWith(tostring(e), "Failed to build song")) return;
      Log.fatal(tostring(e));
    }
  }
}