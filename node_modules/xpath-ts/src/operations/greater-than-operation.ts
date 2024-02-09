import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class GreaterThanOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
  }

  toString() {
    return '(' + this.lhs.toString() + ' > ' + this.rhs.toString() + ')';
  }
}
