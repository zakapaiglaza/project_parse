import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class MinusOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).number.minus(this.rhs.evaluate(c).number);
  }

  toString() {
    return '(' + this.lhs.toString() + ' - ' + this.rhs.toString() + ')';
  }
}
