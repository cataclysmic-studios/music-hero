interface PlayerGui extends BasePlayerGui {
  RhythmHUD: ScreenGui & {
    Board: Frame & {
      Viewport: ViewportFrame & {
        RhythmBoard: Part;
        FinishPositions: Frame;
      };
    };
  };
}