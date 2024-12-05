import { Controller } from "@flamework/core";

import { SongBuilder } from "client/classes/song-builder";

@Controller()
export class SongBuilderController {
  public readonly builder = new SongBuilder;

  public reset(this: Writable<this>): void {
    this.builder.destroy();
    this.builder = new SongBuilder;
  }
}