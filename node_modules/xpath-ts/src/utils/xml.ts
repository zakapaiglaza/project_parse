import { NamespaceResolver } from '../xpath-types';
import { isElement } from './types';

export function splitQName(qn: string): [string | null, string] {
  const i = qn.indexOf(':');
  if (i === -1) {
    return [null, qn];
  }
  return [qn.substring(0, i), qn.substring(i + 1)];
}

export function resolveQName(qn: string, nr: NamespaceResolver, n: Node, useDefault: boolean) {
  const parts = splitQName(qn);
  if (parts[0] != null) {
    parts[0] = nr.getNamespace(parts[0], n);
  } else {
    if (useDefault) {
      parts[0] = nr.getNamespace('', n);
      if (parts[0] == null) {
        parts[0] = '';
      }
    } else {
      parts[0] = '';
    }
  }
  return parts;
}

export function getElementById(n: Node, id: string): Element | null {
  // Note that this does not check the DTD to check for actual
  // attributes of type ID, so this may be a bit wrong.
  if (isElement(n)) {
    if (n.getAttribute('id') === id || n.getAttributeNS(null, 'id') === id) {
      return n;
    }
  }
  for (let m: Node | null = n.firstChild; m != null; m = m.nextSibling) {
    const res = getElementById(m, id);
    if (res != null) {
      return res;
    }
  }
  return null;
}
