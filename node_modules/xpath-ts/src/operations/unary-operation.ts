import { Expression } from '../xpath-types';

export class UnaryOperation extends Expression {
  rhs: Expression;

  constructor(rhs: Expression) {
    super();

    this.rhs = rhs;
  }
}
