import { NamespaceResolverImpl } from './namespace-resolver';
import { NamespaceResolver } from './xpath-types';

export class NodeXPathNSResolver {
  node?: Node;
  namespaceResolver: NamespaceResolver;

  constructor(n?: Node) {
    this.node = n;
    this.namespaceResolver = new NamespaceResolverImpl();
  }

  lookupNamespaceURI(prefix: string) {
    return this.namespaceResolver.getNamespace(prefix, this.node !== undefined ? this.node : null);
  }
}
