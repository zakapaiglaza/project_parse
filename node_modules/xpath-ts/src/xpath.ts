import { Expression, XPathContext } from './xpath-types';

export class XPath {
  expression: Expression;

  constructor(e: Expression) {
    this.expression = e;
  }

  toString() {
    return this.expression.toString();
  }

  evaluate(c: XPathContext) {
    c.contextNode = c.expressionContextNode;
    c.contextSize = 1;
    c.contextPosition = 1;

    // [2017-11-25] Removed usage of .implementation.hasFeature() since it does
    //              not reliably detect HTML DOMs (always returns false in xmldom and true in browsers)
    if (c.isHtml) {
      if (c.caseInsensitive === undefined) {
        c.caseInsensitive = true;
      }

      if (c.allowAnyNamespaceForNoPrefix === undefined) {
        c.allowAnyNamespaceForNoPrefix = true;
      }
    }

    if (c.caseInsensitive === undefined) {
      c.caseInsensitive = false;
    }

    return this.expression.evaluate(c);
  }
}
