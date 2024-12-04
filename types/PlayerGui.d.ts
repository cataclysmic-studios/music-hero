interface PlayerGui extends BasePlayerGui {
  Menu: ScreenGui & {
    Pages: ImageLabel;
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