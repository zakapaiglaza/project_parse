import { XPathEvaluatorImpl } from './xpath-evaluator';
import { XPathParser } from './xpath-parser';
import { XPathResultImpl } from './xpath-result-impl';
import { FunctionResolver, VariableResolver } from './xpath-types';

const defaultEvaluator = new XPathEvaluatorImpl({});

export function select1(e: string, doc?: Node) {
  return select(e, doc, true);
}

export function select(e: string, doc?: Node, single: boolean = false) {
  return selectWithResolver(e, doc, null, single);
}

export function useNamespaces(mappings: { [key: string]: string | null }) {
  const resolver = {
    mappings: mappings || {},
    lookupNamespaceURI(prefix: string) {
      return this.mappings[prefix] !== undefined ? this.mappings[prefix] : null;
    }
  };

  return (e: string, doc: Node, single: boolean = false) => {
    return selectWithResolver(e, doc, resolver, single);
  };
}

export function selectWithResolver(
  e: string,
  doc: Node | undefined,
  resolver: XPathNSResolver | null,
  single: boolean = false
) {
  const result = evaluate(e, doc, resolver, XPathResultImpl.ANY_TYPE, null);
  if (result.resultType === XPathResultImpl.STRING_TYPE) {
    return result.stringValue;
  } else if (result.resultType === XPathResultImpl.NUMBER_TYPE) {
    return result.numberValue;
  } else if (result.resultType === XPathResultImpl.BOOLEAN_TYPE) {
    return result.booleanValue;
  } else {
    if (single) {
      return result.nodes[0];
    }

    return result.nodes;
  }
}

export function evaluate(
  expression: string,
  contextNode?: Node,
  resolver?: XPathNSResolver | null,
  type: number = 0,
  result?: XPathResult | null
) {
  return defaultEvaluator.evaluate(expression, contextNode!, resolver ? resolver : null, type, result ? result : null);
}

export function installXPathSupport(
  doc: Document,
  { fr, vr, p }: { fr?: FunctionResolver; vr?: VariableResolver; p?: XPathParser }
): Document & XPathEvaluator {
  const evaluator = new XPathEvaluatorImpl({ fr, vr, p });

  (doc as any).createExpression = evaluator.createExpression;
  (doc as any).createNSResolver = evaluator.createNSResolver;
  (doc as any).evaluate = evaluator.evaluate;

  return (doc as unknown) as Document & XPathEvaluator;
}
