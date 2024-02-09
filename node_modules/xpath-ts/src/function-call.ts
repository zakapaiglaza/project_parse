import { FunctionResolverImpl } from './function-resolver';
import { Expression, XPathContext } from './xpath-types';

export class FunctionCall extends Expression {
  functionName: string;
  arguments: Expression[];

  constructor(fn: string, args: Expression[]) {
    super();

    this.functionName = fn;
    this.arguments = args;
  }

  evaluate(c: XPathContext) {
    const f = FunctionResolverImpl.getFunctionFromContext(this.functionName, c);

    if (f === undefined) {
      throw new Error('Unknown function ' + this.functionName);
    }

    return f(c, ...this.arguments);
  }

  toString() {
    const args = this.arguments.map((a) => a.toString()).join(', ');

    return `${this.functionName}(${args})`;
  }
}
