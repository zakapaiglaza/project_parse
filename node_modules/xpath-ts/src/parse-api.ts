import { FunctionResolverImpl } from './function-resolver';
import { NamespaceResolverImpl } from './namespace-resolver';
import { VariableResolverImpl } from './variable-resolver';
import { XPath } from './xpath';
import { XPathParser } from './xpath-parser';
import { Expression, FunctionType, XBoolean, XNodeSet, XNumber, XPathContext, XString } from './xpath-types';

const parser = new XPathParser();

const defaultNSResolver = new NamespaceResolverImpl();
const defaultFunctionResolver = new FunctionResolverImpl();
const defaultVariableResolver = new VariableResolverImpl();

function makeNSResolverFromFunction(func: (prefix: string, n: Node) => string | null) {
  return {
    getNamespace(prefix: string, node: Node) {
      const ns = func(prefix, node);

      return ns || defaultNSResolver.getNamespace(prefix, node);
    }
  };
}

function makeNSResolverFromObject(obj: { getNamespace: (prefix: string, n: Node) => string | null }) {
  return makeNSResolverFromFunction(obj.getNamespace.bind(obj));
}

function makeNSResolverFromMap(map: { [key: string]: string | null }) {
  return makeNSResolverFromFunction((prefix) => {
    return map[prefix];
  });
}

export function makeNSResolver(resolver: any) {
  if (resolver && typeof resolver.getNamespace === 'function') {
    return makeNSResolverFromObject(resolver);
  }

  if (typeof resolver === 'function') {
    return makeNSResolverFromFunction(resolver);
  }

  // assume prefix -> uri mapping
  if (typeof resolver === 'object') {
    return makeNSResolverFromMap(resolver);
  }

  return defaultNSResolver;
}

/** Converts native JavaScript types to their XPath library equivalent */
export function convertValue(value: any) {
  if (value == null) {
    return null;
  }

  if (value instanceof XString || value instanceof XBoolean || value instanceof XNumber || value instanceof XNodeSet) {
    return value;
  }

  switch (typeof value) {
    case 'string':
      return new XString(value);
    case 'boolean':
      return new XBoolean(value);
    case 'number':
      return new XNumber(value);
  }

  // assume node(s)
  const ns = new XNodeSet();
  ns.addArray([].concat(value));
  return ns;
}

function makeEvaluator(func: FunctionType): FunctionType {
  return (context: XPathContext, ...args: Expression[]) => {
    args = args.map((a) => a.evaluate(context));
    const result = func(context, ...args);

    return convertValue(result)!; // if result is not null convertValue will not return null
  };
}

function makeFunctionResolverFromFunction(func: (name: string, ns: string) => FunctionType | undefined) {
  return {
    getFunction(name: string, namespace: string) {
      const found = func(name, namespace);
      if (found != null) {
        return makeEvaluator(found);
      }
      return defaultFunctionResolver.getFunction(name, namespace);
    }
  };
}

function makeFunctionResolverFromObject(obj: {
  getFunction: (name: string, namespace: string) => FunctionType | undefined;
}) {
  return makeFunctionResolverFromFunction(obj.getFunction.bind(obj));
}

function makeFunctionResolverFromMap(map: { [key: string]: FunctionType | undefined }) {
  return makeFunctionResolverFromFunction((name: string) => {
    return map[name];
  });
}

export function makeFunctionResolver(resolver: any) {
  if (resolver && typeof resolver.getFunction === 'function') {
    return makeFunctionResolverFromObject(resolver);
  }

  if (typeof resolver === 'function') {
    return makeFunctionResolverFromFunction(resolver);
  }

  // assume map
  if (typeof resolver === 'object') {
    return makeFunctionResolverFromMap(resolver);
  }

  return defaultFunctionResolver;
}

function makeVariableResolverFromFunction(func: (n: string, ns: string) => any) {
  return {
    getVariable(name: string, namespace: string) {
      const value = func(name, namespace);
      return convertValue(value);
    }
  };
}

export function makeVariableResolver(resolver: any) {
  if (resolver) {
    if (typeof resolver.getVariable === 'function') {
      return makeVariableResolverFromFunction(resolver.getVariable.bind(resolver));
    }

    if (typeof resolver === 'function') {
      return makeVariableResolverFromFunction(resolver);
    }

    // assume map
    if (typeof resolver === 'object') {
      return makeVariableResolverFromFunction((name: string) => {
        return resolver[name];
      });
    }
  }

  return defaultVariableResolver;
}

export interface EvalOptions {
  [key: string]: any;
}

function copyIfPresent(prop: string, dest: { [key: string]: any }, source: EvalOptions) {
  if (prop in source) {
    dest[prop] = source[prop];
  }
}

function makeContext(options?: EvalOptions) {
  const context = new XPathContext(new VariableResolverImpl(), new NamespaceResolverImpl(), new FunctionResolverImpl());

  if (options !== undefined) {
    context.namespaceResolver = makeNSResolver(options.namespaces);
    context.functionResolver = makeFunctionResolver(options.functions);
    context.variableResolver = makeVariableResolver(options.variables);
    context.expressionContextNode = options.node;

    copyIfPresent('allowAnyNamespaceForNoPrefix', context, options);
    copyIfPresent('isHtml', context, options);
  } else {
    context.namespaceResolver = defaultNSResolver;
  }

  return context;
}

function evaluate(parsedExpression: XPath, options?: { [key: string]: any }) {
  const context = makeContext(options);

  return parsedExpression.evaluate(context);
}

export function parse(xpath: string) {
  const parsed = parser.parse(xpath);

  return new class {
    expression = parsed;

    evaluate(options?: EvalOptions) {
      return evaluate(this.expression, options);
    }

    evaluateNumber(options?: EvalOptions) {
      return this.evaluate(options).numberValue;
    }

    evaluateString(options?: EvalOptions) {
      return this.evaluate(options).stringValue;
    }

    evaluateBoolean(options?: EvalOptions) {
      return this.evaluate(options).booleanValue;
    }

    evaluateNodeSet(options?: EvalOptions) {
      return this.evaluate(options).nodeset;
    }

    select(options?: EvalOptions) {
      return this.evaluateNodeSet(options).toArray();
    }

    select1(options?: EvalOptions) {
      return this.select(options)[0];
    }
  }();
}
