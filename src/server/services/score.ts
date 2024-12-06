import { Service } from "@flamework/core";

import { LinkSerializedRemote } from "server/decorators";
import { Events } from "server/network";
import { Serializers } from "shared/network";
import { calculateStars } from "shared/game-utility";
import type { ScoreCardSavePacket } from "shared/structs/packets";
import type { PlayerData } from "shared/data-models/player-data";

import type { DataService } from "./third-party/data";

@Service()
export class ScoreService {
  public constructor(
    private readonly data: DataService
  ) { }

  @LinkSerializedRemote(Events.data.saveScoreCard, Serializers.scoreCardSave)
  public saveScoreCard(player: Player, { songName, scoreCard }: ScoreCardSavePacket): void {
    const data = this.data.get<Writable<PlayerData>>(player);
    if (data.songScores[songName] === undefined)
      data.songScores[songName] = [];

    data.songScores[songName].push(scoreCard);
    data.stars += calculateStars(scoreCard);
    this.data.set(player, data);
  }
}