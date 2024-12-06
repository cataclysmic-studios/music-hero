import { Controller } from "@flamework/core";
import Iris from "@rbxts/iris";

import { calculateAccuracy } from "shared/game-utility";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import { ControlPanelRenderable } from "./control-panel";
import type { ScoreController } from "client/controllers/score";

@Controller()
@ControlPanelRenderable("Song Stats")
export class SongStatsController implements ControlPanelDropdownRenderer {
  public constructor(
    private readonly score: ScoreController
  ) { }

  public renderControlPanelDropdown(): void {
    const scoreCard = this.score.card();
    const { goodNotes, perfectNotes, missedNotes } = scoreCard;
    Iris.Text([`Good Notes: <b>${goodNotes}</b>`, undefined, undefined, true]);
    Iris.Text([`Perfect Notes: <b>${perfectNotes}</b>`, undefined, undefined, true]);
    Iris.Text([`Missed Notes: <b>${missedNotes}</b>`, undefined, undefined, true]);
    Iris.Text([`Completed Notes: <b>${goodNotes + perfectNotes}</b>`, undefined, undefined, true]);
    Iris.Text([`Total Notes: <b>${goodNotes + perfectNotes + missedNotes}</b>`, undefined, undefined, true]);
    Iris.Text([`Accuracy: <b>${math.round(calculateAccuracy(scoreCard))}%</b>`, undefined, undefined, true]);
  }
}