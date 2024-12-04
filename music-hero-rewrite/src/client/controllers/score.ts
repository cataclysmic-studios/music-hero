import { Controller, Dependency, OnStart } from "@flamework/core";
import type { Components } from "@flamework/components";
import { atom } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { Events } from "client/network";
import { SongDifficulty } from "shared/structs/song-info";
import { VALID_NOTE_RADIUS } from "shared/constants";
import { getNotesInRadius } from "shared/game-utility";

import { SongController } from "./song";

const { round, floor, clamp, abs } = math;

const PERFECT_NOTE_RADIUS = VALID_NOTE_RADIUS / 2.5;
const STAR_ACCURACY_THRESHOLDS = [35, 70, 80, 90, 95];
const MAX_MULTIPLIER = 16;

type StarAmount = 0 | 1 | 2 | 3 | 4 | 5;

@Controller()
export class ScoreController implements OnStart {
  public readonly updated = new Signal;
  public readonly noteAttempted = new Signal<(notePosition: NotePosition) => void>;
  public readonly noteCompleted = new Signal<(notePosition: NotePosition) => void>;
  public readonly overdriveProgress = atom(0);
  public readonly current = atom(0);
  public readonly multiplier = atom(1);
  public readonly nextMultiplierProgress = atom(0);
  public readonly starsProgress = atom(0);
  public goodNotes = 0;
  public perfectNotes = 0;
  public totalNotes = 0;
  public missedNotes = 0;

  private currentSong?: SongName;
  private noteTrack?: Model;
  private inOverdrive = false;

  public onStart(): void {
    task.delay(3, () => this.updated.Fire());
    Dependency<SongController>().noteTrackSet.Connect(noteTrack => this.noteTrack = noteTrack);
  }

  public async calculateScore(): Promise<void> {
    if (this.currentSong === undefined) return;
    Events.data.addSongScoreCard(this.currentSong, {
      totalNotes: this.totalNotes,
      accuracy: this.getAccuracy(),
      goodNotes: this.goodNotes,
      perfectNotes: this.perfectNotes,
      missedNotes: this.missedNotes,
      points: this.current(),
      starsProgress: this.calculateStarsProgress(),
      stars: this.calculateStars()
    });

    this.reset();
  }

  public setSong(songName: SongName): void {
    this.currentSong = songName;
  }

  public setTotalNotes(totalNotes: number): void {
    this.totalNotes = totalNotes;
  }

  public attemptNote(notePosition: NotePosition, difficulty: SongDifficulty): void {
    if (this.noteTrack === undefined) return;
    if (notePosition === 5 && difficulty !== SongDifficulty.Expert) return;
    this.noteAttempted.Fire(notePosition);

    const [pressedNote] = getNotesInRadius(this.noteTrack, notePosition);
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

    const accuracyRatio = 75; // if your note was 1 stud away, you'd have accuracyRatio% accuracy
    this.addCompletedNote(isPerfect, clamp(abs(accuracyRatio / 100 / zPosition), 0.1, 1));
    this.noteCompleted.Fire(notePosition);
  }

  public add(amount: number): void {
    if (this.currentSong === undefined) return;
    this.current(this.current() + (amount * this.multiplier() * (this.inOverdrive ? 2 : 1)));
  }

  public addCompletedNote(perfect: boolean, accuracy: number): void {
    if (this.currentSong === undefined) return;

    this[perfect ? "perfectNotes" : "goodNotes"]++;
    this.addMultiplierProgress(round(30 / (this.multiplier() / 2.75)));
    this.add(floor((10 + (perfect ? 5 : 0)) * accuracy));
    this.updated.Fire();
  }

  public addFailedNote(): void {
    this.missedNotes++;
    this.resetMultiplier();
    this.updated.Fire();
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

  public addOverdriveProgress(progress: number): void {
    if (this.currentSong === undefined) return;
    this.overdriveProgress(this.overdriveProgress() + progress);
  }

  public resetMultiplier(): void {
    this.multiplier(1);
    this.nextMultiplierProgress(0);
  }

  public getAccuracy(): number {
    if (this.goodNotes === 0 && this.perfectNotes === 0)
      return 0;

    return (this.goodNotes + this.perfectNotes) / this.totalNotes * 100;
  }

  private nextMultiplier(): void {
    if (this.multiplier() === MAX_MULTIPLIER) return;
    this.multiplier(math.min(this.multiplier() * 2, MAX_MULTIPLIER));
    this.nextMultiplierProgress(0);
  }

  private addMultiplierProgress(progress: number): void {
    if (!this.currentSong) return;
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
    this.current(0);
    this.setOverdriveProgress(0);
    this.goodNotes = 0;
    this.perfectNotes = 0;
    this.totalNotes = 0;
    this.currentSong = undefined;
  }

  private calculateStarsProgress(): number {
    const currentStars = this.calculateStars();
    if (currentStars === 5)
      return 500;

    const accuracy = this.getAccuracy();
    switch (currentStars) {
      case 0: return accuracy / STAR_ACCURACY_THRESHOLDS[0] * 100;

      case 1:
      case 2:
      case 3:
      case 4: {
        const lastThreshold = STAR_ACCURACY_THRESHOLDS[currentStars - 1];
        const threshold = STAR_ACCURACY_THRESHOLDS[currentStars];
        return (currentStars * 100) + ((accuracy - lastThreshold) / (threshold - lastThreshold) * 100);
      }
    }
  }

  private calculateStars(): StarAmount {
    const accuracy = this.getAccuracy();
    for (let i = 0; i < 5; i++)
      if (accuracy >= STAR_ACCURACY_THRESHOLDS[i])
        return <StarAmount>(i + 1);

    return 0;
  }
}