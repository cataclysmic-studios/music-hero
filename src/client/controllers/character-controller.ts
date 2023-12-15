import { Controller, OnInit } from "@flamework/core";
import { Player } from "shared/utilities/helpers";

@Controller()
export class CharacterController implements OnInit {
  public onInit(): void {
    const humanoid = Player.CharacterAdded.Wait()[0].FindFirstChildOfClass("Humanoid")!;
    humanoid.WalkSpeed = 0;
    humanoid.JumpHeight = 0;
  }
}