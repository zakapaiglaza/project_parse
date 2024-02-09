import { resolveQName } from './utils/xml';
import { XPathException } from './xpath-exception';
import { Expression, XPathContext } from './xpath-types';

export class VariableReference extends Expression {
  variable: string;

  constructor(v: string) {
    super();

    this.variable = v;
  }

  toString() {
    return '$' + this.variable;
  }

  evaluate(c: XPathContext) {
    const parts = resolveQName(this.variable, c.namespaceResolver, c.contextNode, false);

    if (parts[0] == null) {
      throw new Error('Cannot resolve QName ' + this.variable);
    }
    const result = c.variableResolver.getVariable(parts[1], parts[0]);
    if (!result) {
      throw XPathException.fromMessage('Undeclared variable: ' + this.toString());
    }
    return result;
  }
}
