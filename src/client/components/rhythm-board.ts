import { Component, BaseComponent } from "@flamework/components";

@Component({ tag: "RhythmBoard" })
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  public setNoteTrack(noteTrack: Model): void {
    this.instance.Parent?.FindFirstChild("Notes")?.Destroy();
    noteTrack.Name = "Notes";
    noteTrack.Parent = this.instance.Parent;
  }
}