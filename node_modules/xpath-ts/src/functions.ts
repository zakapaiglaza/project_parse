import { XML_NAMESPACE_URI } from './consts';
import { isSpace } from './utils/character';
import { isAttribute, isDocument, isElement, isProcessingInstruction } from './utils/types';
import { getElementById } from './utils/xml';
import { Expression, XBoolean, XNodeSet, XNumber, XPathContext, XString } from './xpath-types';

// tslint:disable:prefer-for-of

export class Functions {
  static last(c: XPathContext, ...args: Expression[]) {
    checkArguments(0, args, 'last');

    return new XNumber(c.contextSize);
  }

  static position(c: XPathContext, ...args: Expression[]) {
    checkArguments(0, args, 'position');

    return new XNumber(c.contextPosition);
  }

  static count(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'count');

    const ns = args[0].evaluate(c);
    if (!(ns instanceof XNodeSet)) {
      throw new Error('Function count expects (node-set)');
    }
    return new XNumber(ns.size);
  }

  static id(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'id');

    const eRes: Expression = args[0].evaluate(c);

    let ids: string[];

    if (eRes instanceof XNodeSet) {
      ids = eRes.toArray().map((node) => XNodeSet.prototype.stringForNode(node));
    } else {
      const id = eRes.stringValue;
      ids = id.split(/[\x0d\x0a\x09\x20]+/);
    }

    const ns = new XNodeSet();
    const doc = isDocument(c.contextNode) ? c.contextNode : c.contextNode.ownerDocument!;

    for (let i = 0; i < ids.length; i++) {
      let n: Element | null;
      if (doc.getElementById) {
        n = doc.getElementById(ids[i]);
      } else {
        n = getElementById(doc, ids[i]);
      }
      if (n != null) {
        ns.add(n);
      }
    }
    return ns;
  }

  static localName(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'local-name');

    let n: Node | null;
    if (args.length === 0) {
      n = c.contextNode;
    } else {
      const eRes = args[0].evaluate(c);
      if (!(eRes instanceof XNodeSet)) {
        throw new Error('Function local-name expects (node-set?)');
      }
      n = eRes.first();
    }

    if (n == null) {
      return new XString('');
    }

    if ((isElement(n) || isAttribute(n)) && n.localName != null) {
      return new XString(n.localName);
    } else if (isProcessingInstruction(n)) {
      return new XString(n.target);
    } else {
      return new XString(n.nodeName != null ? n.nodeName : '');
    }
  }

  static namespaceURI(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'namespace-uri');

    let n: Node | null;
    if (args.length === 0) {
      n = c.contextNode;
    } else {
      const eRes = args[0].evaluate(c);
      if (!(eRes instanceof XNodeSet)) {
        throw new Error('Function namspace-uri expects (node-set?)');
      }
      n = eRes.first();
    }

    if (n == null) {
      return new XString('');
    }
    return new XString(n.namespaceURI);
  }

  static name_(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'name');

    let n: Node | null;
    if (args.length === 0) {
      n = c.contextNode;
    } else {
      const eRes = args[0].evaluate(c);
      if (!(eRes instanceof XNodeSet)) {
        throw new Error('Function name expects (node-set?)');
      }
      n = eRes.first();
    }

    if (n == null) {
      return new XString('');
    }
    if (isElement(n)) {
      return new XString(n.nodeName);
    } else if (isAttribute(n)) {
      return new XString(n.name || n.nodeName);
    } else if (isProcessingInstruction(n)) {
      return new XString(n.target || n.nodeName);
    } else if ((n as any).localName == null) {
      return new XString('');
    } else {
      return new XString((n as any).localName);
    }
  }

  static string(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'string');

    if (args.length === 0) {
      return new XString(XNodeSet.prototype.stringForNode(c.contextNode));
    } else {
      return args[0].evaluate(c).string;
    }
  }

  static concat(c: XPathContext, ...args: Expression[]) {
    if (args.length < 2) {
      throw new Error('Function concat expects (string, string[, string]*)');
    }
    let s = '';
    for (let i = 0; i < args.length; i++) {
      s += args[i].evaluate(c).stringValue;
    }
    return new XString(s);
  }

  static startsWith(c: XPathContext, ...args: Expression[]) {
    checkArguments(2, args, 'starts-with');

    const s1 = args[0].evaluate(c).stringValue;
    const s2 = args[1].evaluate(c).stringValue;
    return new XBoolean(s1.substring(0, s2.length) === s2);
  }

  static contains(c: XPathContext, ...args: Expression[]) {
    checkArguments(2, args, 'contains');

    const s1 = args[0].evaluate(c).stringValue;
    const s2 = args[1].evaluate(c).stringValue;
    return new XBoolean(s1.indexOf(s2) !== -1);
  }

  static substringBefore(c: XPathContext, ...args: Expression[]) {
    checkArguments(2, args, 'substring-before');

    const s1 = args[0].evaluate(c).stringValue;
    const s2 = args[1].evaluate(c).stringValue;
    return new XString(s1.substring(0, s1.indexOf(s2)));
  }

  static substringAfter(c: XPathContext, ...args: Expression[]) {
    checkArguments(2, args, 'substring-after');

    const s1 = args[0].evaluate(c).stringValue;
    const s2 = args[1].evaluate(c).stringValue;
    if (s2.length === 0) {
      return new XString(s1);
    }
    const i = s1.indexOf(s2);
    if (i === -1) {
      return new XString('');
    }
    return new XString(s1.substring(i + s2.length));
  }

  static substring(c: XPathContext, ...args: Expression[]) {
    checkArguments([2, 3], args, 'substring');

    const s = args[0].evaluate(c).stringValue;
    const n1 = Math.round(args[1].evaluate(c).numberValue) - 1;
    const n2 = args.length === 3 ? n1 + Math.round(args[2].evaluate(c).numberValue) : undefined;
    return new XString(s.substring(n1, n2));
  }

  static stringLength(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'string-length');

    let s: string;
    if (args.length === 0) {
      s = XNodeSet.prototype.stringForNode(c.contextNode) || '';
    } else {
      s = args[0].evaluate(c).stringValue;
    }

    return new XNumber(s.length);
  }

  static normalizeSpace(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'normalize-space');

    let s: string;
    if (args.length === 0) {
      s = XNodeSet.prototype.stringForNode(c.contextNode);
    } else {
      s = args[0].evaluate(c).stringValue;
    }

    let i = 0;
    let j = s.length - 1;
    while (isSpace(s.charCodeAt(j))) {
      j--;
    }
    let t = '';
    while (i <= j && isSpace(s.charCodeAt(i))) {
      i++;
    }
    while (i <= j) {
      if (isSpace(s.charCodeAt(i))) {
        t += ' ';
        while (i <= j && isSpace(s.charCodeAt(i))) {
          i++;
        }
      } else {
        t += s.charAt(i);
        i++;
      }
    }
    return new XString(t);
  }

  static translate(c: XPathContext, ...args: Expression[]) {
    checkArguments(3, args, 'translate');

    const value = args[0].evaluate(c).stringValue;
    const from = args[1].evaluate(c).stringValue;
    const to = args[2].evaluate(c).stringValue;

    const cMap = [...from].reduce(
      (acc, ch, i) => {
        if (!(ch in acc)) {
          acc[ch] = i > to.length ? '' : to[i];
        }
        return acc;
      },
      {} as { [key: string]: string }
    );

    const t = [...value].map((ch) => (ch in cMap ? cMap[ch] : ch)).join('');

    return new XString(t);
  }

  static boolean_(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'boolean');

    return args[0].evaluate(c).bool;
  }

  static not(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'not');

    return args[0].evaluate(c).bool.not();
  }

  static true_(_c: XPathContext, ...args: Expression[]) {
    checkArguments(0, args, 'true');

    return XBoolean.TRUE;
  }

  static false_(_c: XPathContext, ...args: Expression[]) {
    checkArguments(0, args, 'false');

    return XBoolean.FALSE;
  }

  static lang(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'lang');

    let lang: string | null = null;
    for (let n: Node | null = c.contextNode; n != null && !isDocument(n); n = n.parentNode) {
      if (isElement(n)) {
        const a = n.getAttributeNS(XML_NAMESPACE_URI, 'lang');
        if (a != null) {
          lang = String(a);
          break;
        }
      }
    }
    if (lang == null) {
      return XBoolean.FALSE;
    }
    const s = args[0].evaluate(c).stringValue;
    return new XBoolean(
      lang.substring(0, s.length) === s && (lang.length === s.length || lang.charAt(s.length) === '-')
    );
  }

  static number(c: XPathContext, ...args: Expression[]) {
    checkArguments([0, 1], args, 'number');

    if (args.length === 0) {
      return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
    }
    return args[0].evaluate(c).number;
  }

  static sum(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'sum');
    const ns = args[0].evaluate(c);

    if (!(ns instanceof XNodeSet)) {
      throw new Error('Function sum expects (node-set)');
    }

    const ua = ns.toUnsortedArray();
    let n = 0;
    for (let i = 0; i < ua.length; i++) {
      n += new XNumber(XNodeSet.prototype.stringForNode(ua[i])).numberValue;
    }
    return new XNumber(n);
  }

  static floor(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'floor');

    return new XNumber(Math.floor(args[0].evaluate(c).numberValue));
  }

  static ceiling(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'ceiling');

    return new XNumber(Math.ceil(args[0].evaluate(c).numberValue));
  }

  static round(c: XPathContext, ...args: Expression[]) {
    checkArguments(1, args, 'round');

    return new XNumber(Math.round(args[0].evaluate(c).numberValue));
  }
}

function checkArguments(expected: number | number[], args: Expression[], name: string) {
  if (typeof expected === 'number') {
    expected = [expected];
  }

  if (!expected.includes(args.length)) {
    throw new Error(`Function ${name} expects ${expected.join(' or ')} arguments instead of ${args.length}`);
  }
}
