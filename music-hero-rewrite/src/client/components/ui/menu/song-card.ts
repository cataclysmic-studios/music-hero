import type { OnStart } from "@flamework/core";
import { Component, BaseComponent, type Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { $nameof } from "rbxts-transform-debug";

import type { SongSelectController } from "client/controllers/song-select";
import { tween } from "@rbxts/instance-utility";

@Component({ tag: $nameof<SongCard>() })
export class SongCard extends BaseComponent<{}, ImageButton & { Checkmark: ImageLabel; Title: TextLabel & { UIStroke: UIStroke } }> implements OnStart {
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.2)
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetEasingDirection(Enum.EasingDirection.In)
    .Build();

  public constructor(
    private readonly components: Components,
    private readonly selected: SongSelectController
  ) { super(); }

  public onStart(): void {
    const defaultBackgroundTrans = this.instance.Title.BackgroundTransparency;
    const defaultTextTrans = this.instance.Title.TextTransparency;
    const defaultStrokeTrans = this.instance.Title.UIStroke.Transparency;

    this.instance.MouseButton1Click.Connect(() => {
      if (this.instance.Title.Text !== "Paradise Falls") return; // temp

      this.selected.song = <SongName>this.instance.Title.Text;
      for (const songCard of this.components.getAllComponents<SongCard>())
        this.instance.Checkmark.Visible = songCard.instance.Name === this.instance.Name;
    });
    this.instance.MouseEnter.Connect(() => {
      tween(this.instance.Title.UIStroke, this.tweenInfo, { Transparency: defaultStrokeTrans });
      tween(this.instance.Title, this.tweenInfo, {
        BackgroundTransparency: defaultBackgroundTrans,
        TextTransparency: defaultTextTrans
      });
    });
    this.instance.MouseLeave.Connect(() => {
      tween(this.instance.Title.UIStroke, this.tweenInfo, { Transparency: 1 });
      tween(this.instance.Title, this.tweenInfo, {
        BackgroundTransparency: 1,
        TextTransparency: 1
      });
    });
  }
}