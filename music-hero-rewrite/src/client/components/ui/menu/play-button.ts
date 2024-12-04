import { Component } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";

import { MenuButton } from "client/base-components/menu-button";

@Component({
  tag: $nameof<MenuPlayButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuPlayButton extends MenuButton implements LogStart {
  protected onClick(): void {
    this.menu.setPage("SongSelect");
  }
}