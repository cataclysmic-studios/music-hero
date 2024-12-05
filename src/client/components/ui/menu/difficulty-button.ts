import type { OnStart } from "@flamework/core";
import { Component, BaseComponent, type Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";
import { SongDifficulty } from "shared/structs/song-info";

import type { SongBuilderController } from "client/controllers/song-builder";

@Component({
  tag: $nameof<DifficultyButton>(),
  ancestorWhitelist: [PlayerGui]
})
export class DifficultyButton extends BaseComponent<{}, GuiButton & { UICorner: UICorner; UIStroke: UIStroke }> implements OnStart {
  private readonly defaultCornerRadius = this.instance.UICorner.CornerRadius;
  private readonly defaultBorderThickness = this.instance.UIStroke.Thickness;
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.075)
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetEasingDirection(Enum.EasingDirection.In)
    .Build();

  private isSelected = false;

  public constructor(
    private readonly components: Components,
    private readonly songBuilder: SongBuilderController
  ) { super(); }

  public onStart(): void {
    this.instance.UIStroke.Thickness = 0;
    this.instance.MouseEnter.Connect(() => {
      if (this.isSelected) return;
      tween(this.instance.UIStroke, this.tweenInfo, { Thickness: this.defaultBorderThickness });
    });
    this.instance.MouseLeave.Connect(() => {
      if (this.isSelected) return;
      tween(this.instance.UIStroke, this.tweenInfo, { Thickness: 0 });
    });
    this.instance.MouseButton1Click.Connect(() => {
      if (this.instance.Name !== "Easy") return; // temp

      this.songBuilder.builder.setDifficulty(SongDifficulty[<keyof typeof SongDifficulty>this.instance.Name]);
      for (const difficultyButton of this.components.getAllComponents<DifficultyButton>())
        difficultyButton.toggleSelected(difficultyButton.instance.Name === this.instance.Name);
    });
  }

  public toggleSelected(isSelected: boolean): void {
    this.isSelected = isSelected;
    tween(this.instance.UIStroke, this.tweenInfo, { Thickness: isSelected ? this.defaultBorderThickness : 0 });
    tween(this.instance.UICorner, this.tweenInfo, { CornerRadius: isSelected ? new UDim(1, 0) : this.defaultCornerRadius });
  }
}