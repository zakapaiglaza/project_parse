import { Expression } from '../xpath-types';

export class BinaryOperation extends Expression {
  lhs: Expression;
  rhs: Expression;

  constructor(lhs: Expression, rhs: Expression) {
    super();

    this.lhs = lhs;
    this.rhs = rhs;
  }
}
