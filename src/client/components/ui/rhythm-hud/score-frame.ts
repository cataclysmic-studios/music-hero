import { Component, BaseComponent } from "@flamework/components";
import { commaFormat } from "@rbxts/formatting";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";
import type { SongController } from "client/controllers/song";

interface ScoreFrameInstance extends Frame {
  Title: TextLabel;
  Value: TextLabel;
}

@Component({
  tag: $nameof<ScoreFrame>(),
  ancestorWhitelist: [PlayerGui]
})
export class ScoreFrame extends BaseComponent<{}, ScoreFrameInstance> {
  public constructor(score: ScoreController, song: SongController) {
    super();
    this.update(score.card().score);
    this.updatePart(song.current()?.partName ?? "Lead");
    subscribe(score.card, scoreCard => this.update(scoreCard.score));
    subscribe(song.current, currentSong => {
      if (currentSong === undefined) return;
      this.updatePart(currentSong.partName);
    });
  }

  private updatePart(part: keyof SongParts): void {
    this.instance.Title.Text = `${part.upper()} SCORE`;
    this.instance.Value.Text = "0";
  }

  private update(score: number): void {
    this.instance.Value.Text = commaFormat(score);
  }
}