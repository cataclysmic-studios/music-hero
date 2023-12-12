import { Component, BaseComponent } from "@flamework/components";

@Component({ tag: "RhythmBoard" })
export class RhythmBoard extends BaseComponent<{}, Part & { Grid: Texture }> {
  public addInstrumentTrack(partNotes: Model): void {
    partNotes = partNotes.Clone();
    partNotes.Name = "Notes";
    partNotes.Parent = this.instance.Parent;
  }
}