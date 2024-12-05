import { Service } from "@flamework/core";

import { LinkRemote } from "server/decorators";
import { Events } from "server/network";
import { calculateStars } from "shared/game-utility";
import type { SongScoreCard } from "shared/data-models/song-stats";
import type { PlayerData } from "shared/data-models/player-data";

import type { DataService } from "./third-party/data";

@Service()
export class ScoreService {
  public constructor(
    private readonly data: DataService
  ) { }

  @LinkRemote(Events.data.addSongScoreCard)
  public addSongScoreCard(player: Player, songName: SongName, scoreCard: SongScoreCard): void {
    const data = this.data.get<Writable<PlayerData>>(player);
    if (data.songScores[songName] === undefined)
      data.songScores[songName] = [];

    data.songScores[songName].push(scoreCard);
    data.stars += calculateStars(scoreCard);
    this.data.set(player, data);
  }
}