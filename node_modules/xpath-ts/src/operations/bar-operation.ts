import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class BarOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    return this.lhs.evaluate(c).nodeset.union(this.rhs.evaluate(c).nodeset);
  }

  toString() {
    return this.lhs.toString() + ' | ' + this.rhs.toString();
  }
}
