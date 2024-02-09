import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class DivOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).number.div(this.rhs.evaluate(c).number);
  }

  toString() {
    return '(' + this.lhs.toString() + ' div ' + this.rhs.toString() + ')';
  }
}
