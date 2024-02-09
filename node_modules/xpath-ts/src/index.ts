export { XPath } from './xpath';
export { XPathParser } from './xpath-parser';
export { XPathResultImpl as XPathResult } from './xpath-result-impl';

export { Step } from './step';
export { NodeTest } from './node-test';
export { BarOperation } from './operations/bar-operation';

export { NamespaceResolverImpl as NamespaceResolver } from './namespace-resolver';
export { FunctionResolverImpl as FunctionResolver } from './function-resolver';
export { VariableResolverImpl as VariableResolver } from './variable-resolver';
export { XPathEvaluatorImpl as XPathEvaluator } from './xpath-evaluator';

export { Expression, XNodeSet, XBoolean, XString, XNumber, XPathContext } from './xpath-types';

export { evaluate, select, useNamespaces, selectWithResolver, select1, installXPathSupport } from './api';

export {
  convertValue,
  EvalOptions,
  makeFunctionResolver,
  makeNSResolver,
  makeVariableResolver,
  parse
} from './parse-api';
