interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    Songs: Folder & {
      ["Paradise Falls"]: SongData;
    };
  };
}