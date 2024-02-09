import { Step } from './step';

export class LocationPath {
  absolute: boolean;
  steps: Step[];

  constructor(abs: boolean, steps: Step[]) {
    this.absolute = abs;
    this.steps = steps;
  }

  toString() {
    return (this.absolute ? '/' : '') + this.steps.map((s) => s.toString()).join('/');
  }
}
