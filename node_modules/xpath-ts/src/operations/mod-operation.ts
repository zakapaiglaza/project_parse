import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class ModOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).number.mod(this.rhs.evaluate(c).number);
  }

  toString() {
    return '(' + this.lhs.toString() + ' mod ' + this.rhs.toString() + ')';
  }
}
