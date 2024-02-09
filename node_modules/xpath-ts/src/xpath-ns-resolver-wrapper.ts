import { isNSResolver } from './utils/types';

export class XPathNSResolverWrapper {
  xpathNSResolver: { lookupNamespaceURI(prefix: string | null): string | null; } | null;

  constructor(r: XPathNSResolver | null) {
    if (!isNSResolver(r)) {
      this.xpathNSResolver = null;
    } else {
      this.xpathNSResolver = r as { lookupNamespaceURI(prefix: string | null): string | null; };
    }
  }

  getNamespace(prefix: string, _n: Node) {
    if (this.xpathNSResolver == null) {
      return null;
    }
    return this.xpathNSResolver.lookupNamespaceURI(prefix);
  }
}
