import type { OnStart } from "@flamework/core";
import { Component, BaseComponent, type Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { SongController } from "client/controllers/song";

const HOVER_TRANSPARENCY = 0.7;
const SELECT_TRANSPARENCY = 0.15;

@Component({
  tag: $nameof<PartButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class PartButton extends BaseComponent<{}, ImageButton & { Icon: ImageLabel; GreyOut: ImageButton; }> implements OnStart {
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.085)
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetEasingDirection(Enum.EasingDirection.In)
    .Build();

  private isSelected = false;

  public constructor(
    private readonly components: Components,
    private readonly song: SongController
  ) { super(); }

  public onStart(): void {
    this.instance.MouseEnter.Connect(() => {
      if (this.isSelected) return;
      tween(this.instance, this.tweenInfo, { BackgroundTransparency: HOVER_TRANSPARENCY })
    });
    this.instance.MouseLeave.Connect(() => {
      if (this.isSelected) return;
      tween(this.instance, this.tweenInfo, { BackgroundTransparency: 1 })
    });
    this.instance.MouseButton1Click.Connect(() => {
      if (this.instance.Name !== "Drums") return; // temp

      this.song.builder.setPart(<keyof SongParts>this.instance.Name);
      for (const partButton of this.components.getAllComponents<PartButton>())
        partButton.toggleSelected(partButton.instance.Name === this.instance.Name);
    });
  }

  private toggleSelected(isSelected: boolean): void {
    this.isSelected = isSelected;
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: isSelected ? SELECT_TRANSPARENCY : 1
    });
    tween(this.instance.Icon, this.tweenInfo, {
      ImageColor3: isSelected ? new Color3(0.225, 0.225, 0.225) : new Color3(1, 1, 1)
    });
  }
}