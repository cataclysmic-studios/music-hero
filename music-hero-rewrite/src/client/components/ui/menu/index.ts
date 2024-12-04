import { Component, BaseComponent } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";
import { getChildrenOfType } from "@rbxts/instance-utility";

@Component({
  tag: $nameof<Menu>(),
  ancestorWhitelist: [PlayerGui]
})
export class Menu extends BaseComponent<{}, PlayerGui["Menu"]> {
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