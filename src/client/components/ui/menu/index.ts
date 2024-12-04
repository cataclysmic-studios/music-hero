import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";

@Component({
  tag: $nameof<Menu>(),
  ancestorWhitelist: [PlayerGui]
})
export class Menu extends BaseComponent<{}, PlayerGui["Menu"]> implements OnStart, LogStart {
  public onStart(): void {
    this.enable();
  }

  public setPage(pageName: string): void {
    const pages = getChildrenOfType(this.instance.Pages, "Frame");
    for (const page of pages)
      page.Visible = page.Name === pageName;
  }

  public enable(): void {
    this.instance.Enabled = true;
  }

  public disable(): void {
    this.instance.Enabled = false;
  }
}