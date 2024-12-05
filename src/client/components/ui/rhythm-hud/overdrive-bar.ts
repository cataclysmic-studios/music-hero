import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";

interface OverdriveBarFrame extends Frame {
  Progress: Frame;
}

@Component({
  tag: $nameof<OverdriveBar>(),
  ancestorWhitelist: [PlayerGui]
})
export class OverdriveBar extends BaseComponent<{}, OverdriveBarFrame> {
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.1)
    .Build();

  public constructor(score: ScoreController) {
    super();
    this.instance.Progress.Size = UDim2.fromScale(0, 1);

    this.update(score.overdriveProgress());
    subscribe(score.overdriveProgress, progress => this.update(progress));
  }

  private update(progress: number): void {
    tween(this.instance.Progress, this.tweenInfo, {
      Size: UDim2.fromScale(progress / 100, 1)
    });
  }
}