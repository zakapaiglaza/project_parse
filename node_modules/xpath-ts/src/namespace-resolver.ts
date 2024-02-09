import { XML_NAMESPACE_URI, XMLNS_NAMESPACE_URI } from './consts';
import { PathExpr } from './path-expr';
import { isAttribute, isDocument, isElement } from './utils/types';
import { NamespaceResolver } from './xpath-types';

export class NamespaceResolverImpl implements NamespaceResolver {
  getNamespace(prefix: string, n: Node | null) {
    if (prefix === 'xml') {
      return XML_NAMESPACE_URI;
    } else if (prefix === 'xmlns') {
      return XMLNS_NAMESPACE_URI;
    }
    if (isDocument(n)) {
      n = n.documentElement;
    } else if (isAttribute(n)) {
      n = PathExpr.getOwnerElement(n);
    }

    while (n != null && isElement(n)) {
      const nnm = n.attributes;
      for (let i = 0; i < nnm.length; i++) {
        const a = nnm.item(i)!;
        const aname = a.name || a.nodeName;
        if ((aname === 'xmlns' && prefix === '') || aname === 'xmlns:' + prefix) {
          return String(a.value || a.nodeValue);
        }
      }
      n = n.parentNode;
    }
    return null;
  }
}
