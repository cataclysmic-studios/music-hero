import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";

@Component({ tag: "BeatVisualizer" })
export class BeatVisualizer extends BaseComponent<{}, Frame & { UIStroke: UIStroke }> {
  public visualizeBeat(): void {
    tween(
      this.instance.UIStroke,
      new TweenInfoBuilder()
        .SetTime(0.02)
        .SetEasingStyle(Enum.EasingStyle.Linear)
        .SetEasingDirection(Enum.EasingDirection.In)
        .SetReverses(true),
      { Thickness: 10 }
    );
  }
}