import { Component, BaseComponent } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";
import { SongController } from "client/controllers/song";

interface DebugScreenInstance extends ScreenGui {
  SongStats: Frame & {
    GoodNotes: TextLabel;
    PerfectNotes: TextLabel;
    CompletedNotes: TextLabel;
    MissedNotes: TextLabel;
    TotalNotes: TextLabel;
    Accuracy: TextLabel;
  };
};

@Component({
  tag: $nameof<DebugScreen>(),
  ancestorWhitelist: [PlayerGui]
})
export class DebugScreen extends BaseComponent<{}, DebugScreenInstance> {
  public constructor(
    private readonly score: ScoreController,
    private readonly song: SongController
  ) {
    super();
    score.updated.Connect(() => this.updateSongStats());
  }

  private updateSongStats(): void {
    const stats = this.instance.SongStats;
    stats.GoodNotes.Text = "Good Notes: " + this.score.goodNotes;
    stats.PerfectNotes.Text = "Perfect Notes: " + this.score.perfectNotes;
    stats.CompletedNotes.Text = "Completed Notes: " + (this.score.goodNotes + this.score.perfectNotes);
    stats.MissedNotes.Text = "Missed Notes: " + this.score.missedNotes;
    stats.TotalNotes.Text = "Total Notes: " + this.song.current()?.totalNotes;
    stats.Accuracy.Text = "Accuracy: " + math.round(this.score.getAccuracy()) + "%";
  }
}