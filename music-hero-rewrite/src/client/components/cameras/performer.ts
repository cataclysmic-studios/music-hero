import { Dependency, type OnStart } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { getChildrenOfType, tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { Player } from "client/utility";

import { CameraComponent } from "client/base-components/camera";
import type { CameraController } from "client/controllers/camera";
import { SpawnTask } from "shared/decorators";

@Component({ tag: $nameof<PerformerCamera>() })
export class PerformerCamera extends CameraComponent implements OnStart {
  public static create(controller: CameraController): PerformerCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!;
    camera.Name = $nameof<PerformerCamera>();
    camera.FieldOfView = 50;
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  @SpawnTask()
  public onStart(): void {
    task.wait(2);
    const camera = World.CurrentCamera!;
    const cameraPositions = getChildrenOfType(World.Cameras, "BasePart")
      .sort((a, b) => <number>a.GetAttribute("Order") < <number>b.GetAttribute("Order"));

    const tweenInfo = new TweenInfoBuilder()
      .SetTime(1.75)
      .SetEasingStyle(Enum.EasingStyle.Sine)
      .SetEasingDirection(Enum.EasingDirection.Out);

    tweenInfo.SetDelayTime(3);
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.CFrame = cameraPositions[0].CFrame;

    do {
      for (const cameraPosition of cameraPositions)
        tween(camera, tweenInfo.Build(), { CFrame: cameraPosition.CFrame })
          .Completed.Wait();
    } while (true);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}