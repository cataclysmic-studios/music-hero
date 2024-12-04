import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import { Assets } from "shared/constants";
import { PlayerGui } from "client/utility";

@Component({
  tag: $nameof<SongList>(),
  ancestorWhitelist: [PlayerGui]
})
export class SongList extends BaseComponent<{}, ScrollingFrame> implements OnStart {
  public onStart(): void {
    for (const songData of getChildrenOfType<"Folder", SongData>(Assets.Songs, "Folder"))
      this.createCard(songData);
  }

  private createCard(songData: SongData): void {
    const card = Assets.UI.SongCard.Clone();
    card.Title.Text = songData.Name;
    card.AddTag("SongCard");

    card.Title.BackgroundTransparency = 1;
    card.Title.TextTransparency = 1;
    card.Title.UIStroke.Transparency = 1;
    card.Image = songData.Cover.Image;

    card.Parent = this.instance;
  }
}