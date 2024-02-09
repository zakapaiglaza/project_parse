import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class GreaterThanOrEqualOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
  }

  toString() {
    return '(' + this.lhs.toString() + ' >= ' + this.rhs.toString() + ')';
  }
}
