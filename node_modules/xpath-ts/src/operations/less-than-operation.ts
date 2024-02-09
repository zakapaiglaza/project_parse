import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class LessThanOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
  }

  toString() {
    return '(' + this.lhs.toString() + ' < ' + this.rhs.toString() + ')';
  }
}
