import { XPathContext } from '../xpath-types';
import { UnaryOperation } from './unary-operation';

export class UnaryMinusOperation extends UnaryOperation {
  evaluate(c: XPathContext) {
    return this.rhs.evaluate(c).number.negate();
  }

  toString() {
    return '-' + this.rhs.toString();
  }
}
