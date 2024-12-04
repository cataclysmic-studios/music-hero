import { Controller } from "@flamework/core";
import Signal from "@rbxts/signal";

@Controller()
export class UISignalsController {
  public readonly noteCompleted = new Signal<(position: NotePosition) => void>;
}