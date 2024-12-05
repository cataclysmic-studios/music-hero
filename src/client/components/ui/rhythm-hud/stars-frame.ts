import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { subscribe } from "@rbxts/charm";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";
import { calculateStarsProgress } from "shared/game-utility";

import type { ScoreController } from "client/controllers/score";
import { SongController } from "client/controllers/song";

const { floor, clamp } = math;

interface Star extends ImageLabel {
  Progress: ImageLabel & {
    UIGradient: UIGradient;
  };
}

@Component({
  tag: $nameof<StarsFrame>(),
  ancestorWhitelist: [PlayerGui]
})
export class StarsFrame extends BaseComponent<{}, Frame> {
  private readonly stars = getChildrenOfType<"ImageLabel", Star>(this.instance, "ImageLabel");

  public constructor(score: ScoreController, song: SongController) {
    super();
    const starsProgress = calculateStarsProgress(score.card());
    this.updateStarsProgress(starsProgress)
    subscribe(score.card, scoreCard => this.updateStarsProgress(calculateStarsProgress(scoreCard)));
    subscribe(song.current, currentSong => {
      if (currentSong !== undefined) return;
      this.reset();
    });
  }

  private reset(): void {
    this.updateStarsProgress(0);
  }

  private updateStarsProgress(progress: number): void {
    progress = clamp(progress, 0, 500);
    const filledStars = floor(progress / 100);
    const currentStarProgress = progress - (filledStars * 100);
    for (let i = 1; i <= filledStars; i++) {
      const star = this.stars.find(star => star.LayoutOrder === i);
      if (star === undefined) continue;
      star.Progress.UIGradient.Transparency = new NumberSequence(0);
    }

    const currentStar = this.stars.find(star => star.LayoutOrder === filledStars + 1);
    if (currentStar === undefined) return;
    currentStar.Progress.UIGradient.Transparency = this.getNumberSequenceFromProgress(currentStarProgress);
  }

  private getNumberSequenceFromProgress(progress: number): NumberSequence {
    const fade = 0;

    if (progress === 0)
      return new NumberSequence(1);
    else if (progress === 100)
      return new NumberSequence(0);
    else
      return new NumberSequence([
        new NumberSequenceKeypoint(0, 0),
        new NumberSequenceKeypoint((progress / 100) - 0.01, 0),
        new NumberSequenceKeypoint((progress / 100) + fade, 1),
        new NumberSequenceKeypoint(1, 1)
      ]);
  }
}