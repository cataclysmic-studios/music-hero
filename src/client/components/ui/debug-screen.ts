import { Component, BaseComponent } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";
import { subscribe } from "@rbxts/charm";

import { PlayerGui } from "client/utility";
import { calculateAccuracy } from "shared/game-utility";
import type { SongScoreCard } from "shared/data-models/song-score-card";

import type { ScoreController } from "client/controllers/score";

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
  public constructor(score: ScoreController) {
    super();
    subscribe(score.card, scoreCard => this.updateSongStats(scoreCard));
  }

  private updateSongStats(scoreCard: SongScoreCard): void {
    const { goodNotes, perfectNotes, missedNotes } = scoreCard;
    const stats = this.instance.SongStats;
    stats.GoodNotes.Text = "Good Notes: " + goodNotes;
    stats.PerfectNotes.Text = "Perfect Notes: " + perfectNotes;
    stats.MissedNotes.Text = "Missed Notes: " + missedNotes;
    stats.CompletedNotes.Text = "Completed Notes: " + (goodNotes + perfectNotes);
    stats.TotalNotes.Text = "Total Notes: " + (goodNotes + perfectNotes + missedNotes);
    stats.Accuracy.Text = "Accuracy: " + math.round(calculateAccuracy(scoreCard)) + "%";
  }
}