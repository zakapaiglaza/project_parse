import { Functions } from './functions';
import { resolveQName } from './utils/xml';
import { FunctionResolver, FunctionType, XPathContext } from './xpath-types';

export class FunctionResolverImpl implements FunctionResolver {
  static getFunctionFromContext(qName: string, context: XPathContext) {
    const parts = resolveQName(qName, context.namespaceResolver, context.contextNode, false);

    if (parts[0] === null) {
      throw new Error('Cannot resolve QName ' + name);
    }

    return context.functionResolver.getFunction(parts[1], parts[0]);
  }

  functions: { [key: string]: FunctionType | undefined };

  constructor() {
    this.functions = {};
    this.addStandardFunctions();
  }

  addStandardFunctions() {
    this.functions['{}last'] = Functions.last;
    this.functions['{}position'] = Functions.position;
    this.functions['{}count'] = Functions.count;
    this.functions['{}id'] = Functions.id;
    this.functions['{}local-name'] = Functions.localName;
    this.functions['{}namespace-uri'] = Functions.namespaceURI;
    this.functions['{}name'] = Functions.name_;
    this.functions['{}string'] = Functions.string;
    this.functions['{}concat'] = Functions.concat;
    this.functions['{}starts-with'] = Functions.startsWith;
    this.functions['{}contains'] = Functions.contains;
    this.functions['{}substring-before'] = Functions.substringBefore;
    this.functions['{}substring-after'] = Functions.substringAfter;
    this.functions['{}substring'] = Functions.substring;
    this.functions['{}string-length'] = Functions.stringLength;
    this.functions['{}normalize-space'] = Functions.normalizeSpace;
    this.functions['{}translate'] = Functions.translate;
    this.functions['{}boolean'] = Functions.boolean_;
    this.functions['{}not'] = Functions.not;
    this.functions['{}true'] = Functions.true_;
    this.functions['{}false'] = Functions.false_;
    this.functions['{}lang'] = Functions.lang;
    this.functions['{}number'] = Functions.number;
    this.functions['{}sum'] = Functions.sum;
    this.functions['{}floor'] = Functions.floor;
    this.functions['{}ceiling'] = Functions.ceiling;
    this.functions['{}round'] = Functions.round;
  }

  addFunction(ns: string, ln: string, f: FunctionType) {
    this.functions['{' + ns + '}' + ln] = f;
  }

  getFunction(localName: string, namespace: string) {
    return this.functions['{' + namespace + '}' + localName];
  }
}
