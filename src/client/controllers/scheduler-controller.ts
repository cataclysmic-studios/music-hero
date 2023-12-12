import { Controller, OnRender } from "@flamework/core";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/signal";

@Controller()
export class SchedulerController implements OnRender {
  private counter = 0;
  public every: Record<string, Signal> = {
    second: new Signal
  };

  public onRender(dt: number): void {
    this.counter += dt;
    for (const [unit, signal] of Object.entries(this.every))
      task.spawn(() => {
        const increment = this.getIncrement(unit);
        if (this.counter >= increment) {
          this.counter -= increment;
          signal.Fire();
        }
      });
  }

  private getIncrement(unit: keyof typeof this.every): number {
    switch (unit) {
      case "second": return 1;
    }
    return <any>undefined;
  }
}