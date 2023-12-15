import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";

@Component({ tag: "BeatVisualizer" })
export class BeatVisualizer extends BaseComponent<{}, Frame & { UIStroke: UIStroke }> {
  public visualizeBeat(): void {
    tween(
      this.instance.UIStroke,
      new TweenInfoBuilder()
        .SetTime(0.015)
        .SetEasingStyle(Enum.EasingStyle.Sine)
        .SetEasingDirection(Enum.EasingDirection.Out)
        .SetReverses(true),
      { Thickness: 12 }
    );
  }
}