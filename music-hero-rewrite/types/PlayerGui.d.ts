interface PlayerGui extends BasePlayerGui {
  Menu: ScreenGui & {
    Pages: Frame;
  };
  RhythmHUD: ScreenGui & {
    Board: Frame & {
      Viewport: ViewportFrame & {
        RhythmBoard: Part;
        FinishPositions: Frame;
      };
    };
  };
}