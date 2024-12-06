import { getDescendantsOfType } from "@rbxts/instance-utility";

import { VALID_NOTE_RADIUS } from "./constants";
import { SongScoreCard } from "./data-models/song-score-card";

const NOTE_WORLD_SPACE_POSITIONS = [-6, -2, 2, 6, 10];
const STAR_ACCURACY_THRESHOLDS = [35, 70, 80, 90, 95];

export function calculateStarsProgress(scoreCard: SongScoreCard): number {
  const stars = calculateStars(scoreCard);
  const accuracy = calculateAccuracy(scoreCard);
  if (stars === 5)
    return 500;

  switch (stars) {
    case 0: return accuracy / STAR_ACCURACY_THRESHOLDS[0] * 100;

    case 1:
    case 2:
    case 3:
    case 4: {
      const lastThreshold = STAR_ACCURACY_THRESHOLDS[stars - 1];
      const threshold = STAR_ACCURACY_THRESHOLDS[stars];
      return (stars * 100) + ((accuracy - lastThreshold) / (threshold - lastThreshold) * 100);
    }
  }
}

type StarAmount = 0 | 1 | 2 | 3 | 4 | 5;
export function calculateStars(scoreCard: SongScoreCard): StarAmount {
  const accuracy = calculateAccuracy(scoreCard);
  for (let i = 0; i < 5; i++)
    if (accuracy >= STAR_ACCURACY_THRESHOLDS[i])
      return <StarAmount>(i + 1);

  return 0;
}

export function calculateAccuracy({ goodNotes, perfectNotes, missedNotes }: SongScoreCard): number {
  const totalNotes = goodNotes + perfectNotes + missedNotes;
  return (goodNotes + perfectNotes) / totalNotes * 100;
}

export function getNotesInRadius(noteTrack: Maybe<Model>, notePosition: NotePosition): MeshPart[] {
  return getNotesInPosition(noteTrack, notePosition)
    .sort((noteA, noteB) => noteA.Position.Z > noteB.Position.Z)
    .filter(note => note.Position.Z > 0 ? note.Position.Z <= VALID_NOTE_RADIUS : note.Position.Z >= -VALID_NOTE_RADIUS)
    .map(note => {
      note.SetAttribute("Completed", true);
      return note;
    });
}

function getNotesInPosition(noteTrack: Maybe<Model>, notePosition: NotePosition): MeshPart[] {
  const validPosition = NOTE_WORLD_SPACE_POSITIONS[notePosition - 1];

  return getAllNotes(noteTrack)
    .filter(note => note.Position.X === validPosition)
}

function getAllNotes(noteTrack?: Model): MeshPart[] {
  if (noteTrack === undefined)
    return [];

  return getDescendantsOfType(noteTrack, "MeshPart")
    .filter(note => !note.GetAttribute("Completed"));
}