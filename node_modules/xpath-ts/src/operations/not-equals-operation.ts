import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class NotEqualOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
  }

  toString() {
    return '(' + this.lhs.toString() + ' != ' + this.rhs.toString() + ')';
  }
}
