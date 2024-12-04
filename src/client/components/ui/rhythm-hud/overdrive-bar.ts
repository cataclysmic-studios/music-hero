import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";

@Component({
  tag: $nameof<OverdriveBar>(),
  ancestorWhitelist: [PlayerGui]
})
export class OverdriveBar extends BaseComponent<{}, Frame & { Progress: Frame }> implements OnStart {
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.1)
    .Build();

  public constructor(
    private readonly score: ScoreController
  ) { super(); }

  public onStart(): void {
    this.instance.Progress.Size = UDim2.fromScale(0, 1);

    this.update(this.score.overdriveProgress());
    subscribe(this.score.overdriveProgress, progress => this.update(progress));
  }

  private update(progress: number): void {
    tween(this.instance.Progress, this.tweenInfo, {
      Size: UDim2.fromScale(progress / 100, 1)
    });
  }
}