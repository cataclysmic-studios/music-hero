import { Controller, OnStart } from "@flamework/core";
import { atom, subscribe } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { Events } from "client/network";
import { SongDifficulty } from "shared/structs/song-info";
import { VALID_NOTE_RADIUS } from "shared/constants";
import { getNotesInRadius } from "shared/game-utility";
import type { Song } from "client/classes/song";

import { SongController } from "./song";
import { SongScoreCard } from "shared/data-models/song-stats";

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
export class ScoreController implements OnStart {
  public readonly noteAttempted = new Signal<(notePosition: NotePosition) => void>;
  public readonly noteCompleted = new Signal<(notePosition: NotePosition) => void>;
  public readonly card = atom<Writable<SongScoreCard>>(DEFAULT_SCORE_CARD);
  public readonly overdriveProgress = atom(0);
  public readonly multiplier = atom(1);
  public readonly nextMultiplierProgress = atom(0);

  private currentSong?: Song;
  private inOverdrive = false;

  public constructor(
    private readonly song: SongController
  ) { }

  public onStart(): void {
    subscribe(this.song.current, song => this.currentSong = song);
  }

  public save(): SongScoreCard {
    if (this.currentSong === undefined)
      return undefined!;

    const card = this.card();
    this.reset();
    Events.data.addSongScoreCard(this.currentSong.info.name, card);
    return card;
  }

  public attemptNote(notePosition: NotePosition, difficulty: SongDifficulty): void {
    if (this.currentSong === undefined) return;
    if (notePosition === 5 && difficulty !== SongDifficulty.Expert) return;
    this.noteAttempted.Fire(notePosition);

    const [pressedNote] = getNotesInRadius(this.currentSong.noteTrack, notePosition);
    if (pressedNote === undefined) return;
    if (pressedNote.Transparency > 0) return;
    pressedNote.Transparency = 1;

    const zPosition = pressedNote.Position.Z;
    const noteParent = pressedNote.Parent;
    pressedNote.Destroy();

    const isPerfect = abs(zPosition) <= PERFECT_NOTE_RADIUS;
    const lastOfOverdriveGroup = noteParent!.Name === "OverdriveGroup" && noteParent!.GetChildren().size() === 1;
    if (lastOfOverdriveGroup)
      this.addOverdriveProgress(25);

    const accuracyRatio = ACCURACY_RATIO;
    const accuracy = clamp(abs(accuracyRatio / 100 / zPosition), 0.1, 1);
    this.addCompletedNote(notePosition, isPerfect, accuracy);
  }

  public addFailedNote(): void {
    const card = this.card();
    card.missedNotes++;
    this.card(card);
    this.resetMultiplier();
  }

  public activateOverdrive(): void {
    if (this.currentSong === undefined) return;
    if (this.inOverdrive) return;
    if (this.overdriveProgress() === 0) return;

    this.inOverdrive = true;
    task.spawn(() => {
      while (this.overdriveProgress() > 0) {
        task.wait(0.1);
        this.addOverdriveProgress(-1);
      }
      this.inOverdrive = false;
    });
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
    if (this.currentSong === undefined) return;
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
    if (this.currentSong === undefined) return;
    if (this.multiplier() === MAX_MULTIPLIER) return;
    this.setMultiplierProgress(this.nextMultiplierProgress() + progress);
  }

  private setMultiplierProgress(progress: number): void {
    if (this.currentSong === undefined) return;
    if (progress >= 100) {
      const residual = progress - 100;
      this.nextMultiplier();
      this.addMultiplierProgress(residual)
    } else
      this.nextMultiplierProgress(clamp(progress, 0, 100));
  }

  private setOverdriveProgress(progress: number): void {
    if (this.currentSong === undefined) return;
    this.overdriveProgress(clamp(progress, 0, 100));
  }

  private reset(): void {
    this.resetMultiplier();
    this.setOverdriveProgress(0);
    this.card(DEFAULT_SCORE_CARD);
    this.currentSong = undefined;
  }
}