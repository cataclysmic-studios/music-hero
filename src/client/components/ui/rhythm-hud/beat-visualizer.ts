import { Component, BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { SongController } from "client/controllers/song";
import { subscribe } from "@rbxts/charm";

@Component({
  tag: $nameof<BeatVisualizer>(),
  ancestorWhitelist: [PlayerGui]
})
export class BeatVisualizer extends BaseComponent<{}, Frame & { UIStroke: UIStroke }> {
  private conn?: RBXScriptConnection

  public constructor(song: SongController) {
    super();
    subscribe(song.current, song => {
      if (song === undefined)
        return this.conn?.Disconnect();

      this.conn = song.onBeat.Connect(() => this.visualizeBeat());
    });
  }

  private visualizeBeat(): void {
    tween(
      this.instance.UIStroke,
      new TweenInfoBuilder()
        .SetTime(0.015)
        .SetEasingStyle(Enum.EasingStyle.Sine)
        .SetEasingDirection(Enum.EasingDirection.Out)
        .SetReverses(true)
        .Build(),
      { Thickness: 12 }
    );
  }
}