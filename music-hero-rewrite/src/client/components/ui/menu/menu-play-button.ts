import { Component } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import { MenuButton } from "client/base-components/menu-button";

@Component({
  tag: $nameof<MenuPlayButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class MenuPlayButton extends MenuButton {
  public onClick(): void {
    this.menu.setPage("SongSelect");
  }
}