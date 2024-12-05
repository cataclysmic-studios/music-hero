import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { commaFormat } from "@rbxts/formatting";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import type { ScoreController } from "client/controllers/score";
import type { SongController } from "client/controllers/song";

@Component({
  tag: $nameof<ScoreFrame>(),
  ancestorWhitelist: [PlayerGui]
})
export class ScoreFrame extends BaseComponent<{}, Frame & { Title: TextLabel; Value: TextLabel }> implements OnStart {
  public constructor(
    private readonly score: ScoreController,
    private readonly song: SongController
  ) { super(); }

  public onStart(): void {
    const currentSong = this.song.current();
    this.update(this.score.current());
    this.updatePart(currentSong?.partName ?? "Lead");
    subscribe(this.score.current, score => this.update(score));
    subscribe(this.song.current, song => {
      if (song === undefined) return;
      this.updatePart(song.partName);
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