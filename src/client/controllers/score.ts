import { Controller } from "@flamework/core";
import { atom, subscribe } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { Events } from "client/network";
import { SpawnTask } from "shared/decorators";
import { getNotesInRadius } from "shared/game-utility";
import { SongDifficulty } from "shared/structs/song-info";
import { VALID_NOTE_RADIUS } from "shared/constants";
import type { Song } from "client/classes/song";
import type { SongScoreCard } from "shared/data-models/song-score-card";

import type { SongController } from "./song";
import { Serializers } from "shared/network";

const { round, floor, clamp, abs } = math;

const PERFECT_NOTE_RADIUS = VALID_NOTE_RADIUS / 2.5;
const MAX_MULTIPLIER = 12;
const ACCURACY_RATIO = 75; // if your note was 1 stud away, you'd have ACCURACY_RATIO% accuracy
const DEFAULT_SCORE_CARD: SongScoreCard = {
  score: 0,
  goodNotes: 0,
  perfectNotes: 0,
  missedNotes: 0
};

@Controller()
export class ScoreController {
  public readonly noteAttempted = new Signal<(notePosition: NotePosition) => void>;
  public readonly noteCompleted = new Signal<(notePosition: NotePosition) => void>;
  public readonly card = atom<Writable<SongScoreCard>>(DEFAULT_SCORE_CARD);
  public readonly multiplier = atom(1);
  public readonly nextMultiplierProgress = atom(0);
  public readonly overdriveProgress = atom(0);

  private inOverdrive = false;

  public constructor(
    private readonly song: SongController
  ) { }

  public save(): SongScoreCard {
    const song = this.song.current();
    if (song === undefined)
      return undefined!;

    const card = this.card();
    const packet = Serializers.scoreCardSave.serialize({
      songName: song.info.name,
      scoreCard: card
    });

    this.reset();
    Events.data.saveScoreCard(packet);
    return card;
  }

  public attemptNote(notePosition: NotePosition): void {
    const song = this.song.current();
    if (song === undefined) return;
    if (notePosition === 5 && song.difficulty !== SongDifficulty.Expert) return;
    this.noteAttempted.Fire(notePosition);

    const [pressedNote] = getNotesInRadius(song.noteTrack, notePosition);
    if (pressedNote === undefined) return;
    if (pressedNote.Transparency > 0) return;
    pressedNote.Transparency = 1;

    const zPosition = pressedNote.Position.Z;
    const noteParent = pressedNote.Parent!;
    pressedNote.Destroy();

    const isPerfect = abs(zPosition) <= PERFECT_NOTE_RADIUS;
    const lastOfOverdriveGroup = noteParent.Name === "OverdriveGroup" && noteParent.GetChildren().size() === 1;
    if (lastOfOverdriveGroup)
      this.addOverdriveProgress(25);

    const accuracy = clamp(abs(ACCURACY_RATIO / 100 / zPosition), 0.1, 1);
    this.addCompletedNote(notePosition, isPerfect, accuracy);
  }

  public addFailedNote(): void {
    const card = this.card();
    card.missedNotes++;
    this.card(card);
    this.resetMultiplier();
  }

  @SpawnTask()
  public activateOverdrive(): void {
    if (this.song.current() === undefined) return;
    if (this.inOverdrive) return;
    if (this.overdriveProgress() === 0) return;

    this.inOverdrive = true;
    while (this.overdriveProgress() > 0) {
      task.wait(0.1);
      this.addOverdriveProgress(-1);
    }
    this.inOverdrive = false;
  }

  private addCompletedNote(notePosition: NotePosition, perfect: boolean, accuracy: number): void {
    this.addMultiplierProgress(round(30 / (this.multiplier() / 2.75)));
    this.add(floor((10 + (perfect ? 5 : 0)) * accuracy));

    const card = this.card();
    card[perfect ? "perfectNotes" : "goodNotes"]++;
    this.card(card);
    this.noteCompleted.Fire(notePosition);
  }

  private add(amount: number): void {
    const card = this.card();
    card.score += amount * this.multiplier() * (this.inOverdrive ? 2 : 1);
    this.card(card);
  }

  private addOverdriveProgress(progress: number): void {
    this.overdriveProgress(this.overdriveProgress() + progress);
  }

  private resetMultiplier(): void {
    this.multiplier(1);
    this.nextMultiplierProgress(0);
  }

  private nextMultiplier(): void {
    if (this.multiplier() === MAX_MULTIPLIER) return;
    this.multiplier(math.min(this.multiplier() * 2, MAX_MULTIPLIER));
    this.nextMultiplierProgress(0);
  }

  private addMultiplierProgress(progress: number): void {
    if (this.multiplier() === MAX_MULTIPLIER) return;
    this.setMultiplierProgress(this.nextMultiplierProgress() + progress);
  }

  private setMultiplierProgress(progress: number): void {
    if (progress >= 100) {
      const residual = progress - 100;
      this.nextMultiplier();
      this.addMultiplierProgress(residual)
    } else
      this.nextMultiplierProgress(clamp(progress, 0, 100));
  }

  private setOverdriveProgress(progress: number): void {
    this.overdriveProgress(clamp(progress, 0, 100));
  }

  private reset(): void {
    this.resetMultiplier();
    this.setOverdriveProgress(0);
    this.card(DEFAULT_SCORE_CARD);
  }
}