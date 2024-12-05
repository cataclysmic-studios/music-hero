import { getDescendantsOfType } from "@rbxts/instance-utility";

import { VALID_NOTE_RADIUS } from "./constants";

const NOTE_WORLD_SPACE_POSITIONS = [-6, -2, 2, 6, 10];

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