import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { SoundService as Sound } from "@rbxts/services";

import { PlayerGui } from "client/utility";

@Component({
  tag: "UISounds",
  ancestorWhitelist: [PlayerGui]
})
export class UISounds extends BaseComponent<{}, GuiButton> implements OnStart {
  public onStart(): void {
    this.instance.MouseEnter.Connect(() => Sound.UI_Hover.Play());
    this.instance.MouseButton1Click.Connect(() => Sound.UI_Click.Play());
  }
}