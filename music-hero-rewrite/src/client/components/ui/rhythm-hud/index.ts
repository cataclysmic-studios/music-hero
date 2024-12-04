import type { OnStart } from "@flamework/core";
import { Component, BaseComponent, Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { getChildrenOfType, tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { RhythmBoard } from "../../rhythm-board";

@Component({
  tag: $nameof<RhythmHUD>(),
  ancestorWhitelist: [PlayerGui]
})
export class RhythmHUD extends BaseComponent<{}, PlayerGui["RhythmHUD"]> implements OnStart {
  private readonly finishPositions = this.instance.Board.Viewport.FinishPositions;
  private board!: RhythmBoard;

  public constructor(
    private readonly components: Components
  ) { super(); }

  public async onStart(): Promise<void> {
    this.board = await this.components.waitForComponent<RhythmBoard>(PlayerGui.WaitForChild("RhythmHUD").WaitForChild("Board").WaitForChild("Viewport").WaitForChild("RhythmBoard"));
  }

  public getBoard(): RhythmBoard {
    return this.board;
  }

  public highlightFinishPosition(position: NotePosition): void {
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

  public addNoteCompletionVFX(position: NotePosition): void {
    // const finishPosition = this.getFinishPosition(position);

  }

  public enable(): void {
    this.instance.Enabled = true;
  }

  public disable(): void {
    this.instance.Enabled = false;
  }

  private getFinishPosition(position: NotePosition): Frame {
    return getChildrenOfType(this.finishPositions, "Frame")
      .find(frame => frame.LayoutOrder === position)!;
  }
}