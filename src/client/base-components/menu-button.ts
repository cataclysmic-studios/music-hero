import { Dependency, type OnStart } from "@flamework/core";
import { BaseComponent, Component, type Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";

import { PlayerGui } from "client/utility";

import type { Menu } from "client/components/ui/menu";

@Component()
export abstract class MenuButton extends BaseComponent<{}, GuiButton & { Border: UIStroke }> implements OnStart {
  protected menu!: Menu;

  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.05)
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetEasingDirection(Enum.EasingDirection.In)
    .Build();

  protected abstract onClick(): void;

  public async onStart(): Promise<void> {
    this.menu = await Dependency<Components>().waitForComponent(PlayerGui.WaitForChild("Menu"));
    this.instance.MouseEnter.Connect(() => tween(this.instance.Border, this.tweenInfo, { Thickness: 6 }));
    this.instance.MouseLeave.Connect(() => tween(this.instance.Border, this.tweenInfo, { Thickness: 0 }));
    this.instance.MouseButton1Click.Connect(() => this.onClick());
  }
}