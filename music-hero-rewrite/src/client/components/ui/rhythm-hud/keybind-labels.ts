import { Component, BaseComponent } from "@flamework/components";
import { getChildrenOfType } from "@rbxts/instance-utility";

import type { OnDataUpdate } from "client/hooks";
import { PlayerGui } from "client/utility";
import type { PlayerData } from "shared/data-models/player-data";

type KeycodeFactory = (typeof Enum.KeyCode) & {
  FromValue(value: Enum.KeyCode["Value"]): Enum.KeyCode;
}

@Component({
  tag: "KeybindLabels",
  ancestorWhitelist: [PlayerGui]
})
export class KeybindLabels extends BaseComponent<{}, Frame & { Unlisted: Folder & {} }> implements OnDataUpdate {
  private readonly labels = getChildrenOfType(this.instance, "TextLabel");

  public onDataUpdate({ keybinds }: PlayerData): void {
    for (const label of this.labels)
      label.Text = (<KeycodeFactory>Enum.KeyCode).FromValue(keybinds[label.LayoutOrder - 1]).Name;
  }
}