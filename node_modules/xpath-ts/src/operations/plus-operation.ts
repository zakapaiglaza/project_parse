import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class PlusOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).number.plus(this.rhs.evaluate(c).number);
  }

  toString() {
    return '(' + this.lhs.toString() + ' + ' + this.rhs.toString() + ')';
  }
}
