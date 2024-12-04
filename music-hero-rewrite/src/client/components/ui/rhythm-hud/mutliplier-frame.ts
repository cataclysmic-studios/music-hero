import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";

@Component({
  tag: $nameof<MultiplierFrame>(),
  ancestorWhitelist: [PlayerGui]
})
export class MultiplierFrame extends BaseComponent<{}, Frame & { Label: TextLabel & { Border: UIStroke } }> implements OnStart {
  private currentProgress = 0;

  public constructor(
    private readonly score: ScoreController
  ) { super(); }

  public onStart(): void {
    this.updateProgressBar(this.score.nextMultiplierProgress() / 1000);
    this.instance.GetPropertyChangedSignal("AbsoluteSize")
      .Connect(() => this.updateProgressBar(this.score.nextMultiplierProgress() / 1000));

    this.update(this.score.multiplier());
    subscribe(this.score.multiplier, multiplier => this.update(multiplier));
    subscribe(this.score.nextMultiplierProgress, progress => this.updateProgressBar(progress / 100));
  }

  private update(multiplier: number): void {
    this.instance.Label.Text = `${multiplier}x`;
  }

  private updateProgressBar(progress: number): void {
    const borderThickness = this.calculateBorderThickness() * progress;
    const tweenInfo = new TweenInfoBuilder()
      .SetTime(0.06)
      .SetEasingStyle(Enum.EasingStyle.Sine)
      .SetEasingDirection(Enum.EasingDirection.In)
      .Build();

    tween(this.instance.Label.Border, tweenInfo, { Thickness: borderThickness });
  }

  private calculateBorderThickness(): number {
    const absoluteSize = this.instance.AbsoluteSize.Magnitude / 2;
    const labelAbsoluteSize = this.instance.Label.AbsoluteSize.Magnitude / 2;
    const difference = absoluteSize - labelAbsoluteSize;
    const conversionRatio = 1.621;
    return difference / conversionRatio;
  }
}