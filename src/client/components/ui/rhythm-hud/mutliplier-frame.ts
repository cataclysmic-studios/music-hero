import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";

const TWEEN_INFO = new TweenInfoBuilder()
  .SetTime(0.06)
  .SetEasingStyle(Enum.EasingStyle.Sine)
  .SetEasingDirection(Enum.EasingDirection.In)
  .Build();

interface MultiplierFrameInstance extends Frame {
  Label: TextLabel & {
    Border: UIStroke;
  };
}

@Component({
  tag: $nameof<MultiplierFrame>(),
  ancestorWhitelist: [PlayerGui]
})
export class MultiplierFrame extends BaseComponent<{}, MultiplierFrameInstance> {
  public constructor(score: ScoreController) {
    super();
    this.updateProgressBar(score.nextMultiplierProgress() / 1000);
    this.instance.GetPropertyChangedSignal("AbsoluteSize")
      .Connect(() => this.updateProgressBar(score.nextMultiplierProgress() / 1000));

    this.update(score.multiplier());
    subscribe(score.multiplier, multiplier => this.update(multiplier));
    subscribe(score.nextMultiplierProgress, progress => this.updateProgressBar(progress / 100));
  }

  private update(multiplier: number): void {
    this.instance.Label.Text = `${multiplier}x`;
  }

  private updateProgressBar(progress: number): void {
    const borderThickness = this.calculateBorderThickness() * progress;
    tween(this.instance.Label.Border, TWEEN_INFO, { Thickness: borderThickness });
  }

  private calculateBorderThickness(): number {
    const absoluteSize = this.instance.AbsoluteSize.Magnitude / 2;
    const labelAbsoluteSize = this.instance.Label.AbsoluteSize.Magnitude / 2;
    const difference = absoluteSize - labelAbsoluteSize;
    const conversionRatio = 1.621;
    return difference / conversionRatio;
  }
}