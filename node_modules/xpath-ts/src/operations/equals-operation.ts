import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class EqualsOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
  }

  toString() {
    return '(' + this.lhs.toString() + ' = ' + this.rhs.toString() + ')';
  }
}
