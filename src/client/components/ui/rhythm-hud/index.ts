import { Dependency } from "@flamework/core";
import { Component, BaseComponent, Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { getChildrenOfType, tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";

@Component({
  tag: $nameof<RhythmHUD>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmHUD extends BaseComponent<{}, PlayerGui["RhythmHUD"]> implements LogStart {
  private readonly finishPositions = this.instance.Board.Viewport.FinishPositions;

  public static enable(): void {
    const [hud] = Dependency<Components>().getAllComponents<RhythmHUD>();
    hud.instance.Enabled = true;
  }

  public static disable(): void {
    const [hud] = Dependency<Components>().getAllComponents<RhythmHUD>();
    hud.instance.Enabled = false;
  }

  public constructor(score: ScoreController) {
    super();
    score.noteAttempted.Connect(position => this.highlightFinishPosition(position));
    score.noteCompleted.Connect(position => this.addNoteCompletionVFX(position));
  }

  private highlightFinishPosition(position: NotePosition): void {
    const finishPosition = this.getFinishPosition(position);
    const tweenInfo = new TweenInfoBuilder()
      .SetTime(0.085)
      .SetEasingStyle(Enum.EasingStyle.Sine)
      .SetEasingDirection(Enum.EasingDirection.In)
      .SetReverses(true)
      .Build();

    tween(finishPosition, tweenInfo, {
      BackgroundColor3: Color3.fromRGB(255, 230, 255),
      BackgroundTransparency: 0.325
    });
  }

  // TODO: this
  private addNoteCompletionVFX(position: NotePosition): void {
    // const finishPosition = this.getFinishPosition(position);

  }

  private getFinishPosition(position: NotePosition): Frame {
    return getChildrenOfType(this.finishPositions, "Frame")
      .find(frame => frame.LayoutOrder === position)!;
  }
}