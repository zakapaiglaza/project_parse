import { XPathNamespace } from './xpath-namespace';
import { XPathContext } from './xpath-types';

// tslint:disable:member-ordering

export class NodeTest {
  static NAMETESTANY = 0;
  static NAMETESTPREFIXANY = 1;
  static NAMETESTQNAME = 2;
  static COMMENT = 3;
  static TEXT = 4;
  static PI = 5;
  static NODE = 6;

  static isNodeType(types: number[]) {
    return (n: Node) => {
      return types.includes(n.nodeType) || ((n as Attr).specified && types.includes(2)); // DOM4 support
    };
  }

  // create invariant node test for certain node types
  static makeNodeTypeTest(type: number, nodeTypes: number[], stringVal: string): NodeTest {
    return new class extends NodeTest {
      constructor() {
        super(type);
      }

      matches = NodeTest.isNodeType(nodeTypes);
      toString = () => stringVal;
    }();
  }

  static hasPrefix(node: Node) {
    return (node as any).prefix || (node.nodeName || (node as any).tagName).indexOf(':') !== -1;
  }

  static isElementOrAttribute = NodeTest.isNodeType([1, 2]);

  static nameSpaceMatches(prefix: string | null, xpc: XPathContext, n: Node) {
    const nNamespace = n.namespaceURI || '';

    if (!prefix) {
      return !nNamespace || (xpc.allowAnyNamespaceForNoPrefix && !NodeTest.hasPrefix(n));
    }

    const ns = xpc.namespaceResolver.getNamespace(prefix, n);

    if (ns == null) {
      // throw new Error('Cannot resolve QName ' + prefix);
      return false;
    }

    return ns === nNamespace;
  }

  static localNameMatches = (localName: string, xpc: XPathContext, n: Node) => {
    const nLocalName = (n as Element).localName || n.nodeName;

    return xpc.caseInsensitive ? localName.toLowerCase() === nLocalName.toLowerCase() : localName === nLocalName;
    // tslint:disable-next-line:semicolon
  };

  // tslint:disable-next-line:variable-name
  static NameTestPrefixAny = class extends NodeTest {
    prefix: string;

    constructor(prefix: string) {
      super(NodeTest.NAMETESTPREFIXANY);

      this.prefix = prefix;
    }

    matches(n: Node, xpc: XPathContext) {
      return NodeTest.isElementOrAttribute(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n);
    }

    toString() {
      return this.prefix + ':*';
    }
  };

  // tslint:disable-next-line:variable-name
  static NameTestQName = class extends NodeTest {
    name: string;
    prefix: string | null;
    localName: string;

    constructor(name: string) {
      super(NodeTest.NAMETESTQNAME);

      const nameParts = name.split(':');

      this.name = name;
      this.prefix = nameParts.length > 1 ? nameParts[0] : null;
      this.localName = nameParts[nameParts.length > 1 ? 1 : 0];
    }

    matches(n: Node, xpc: XPathContext) {
      return (
        NodeTest.isNodeType([1, 2, XPathNamespace.XPATH_NAMESPACE_NODE])(n) &&
        NodeTest.nameSpaceMatches(this.prefix, xpc, n) &&
        NodeTest.localNameMatches(this.localName, xpc, n)
      );
    }
    toString() {
      return this.name;
    }
  };

  // tslint:disable-next-line:variable-name
  static PITest = class extends NodeTest {
    name: string;

    constructor(name: string) {
      super(NodeTest.PI);

      this.name = name;
    }

    matches(n: Node, _xpc: XPathContext) {
      return NodeTest.isNodeType([7])(n) && ((n as ProcessingInstruction).target || n.nodeName) === this.name;
    }

    toString() {
      return `processing-instruction("${this.name}")`;
    }
  };

  // elements, attributes, namespaces
  static nameTestAny = NodeTest.makeNodeTypeTest(
    NodeTest.NAMETESTANY,
    [1, 2, XPathNamespace.XPATH_NAMESPACE_NODE],
    '*'
  );
  // text, cdata
  static textTest = NodeTest.makeNodeTypeTest(NodeTest.TEXT, [3, 4], 'text()');
  static commentTest = NodeTest.makeNodeTypeTest(NodeTest.COMMENT, [8], 'comment()');
  // elements, attributes, text, cdata, PIs, comments, document nodes
  static nodeTest = NodeTest.makeNodeTypeTest(NodeTest.NODE, [1, 2, 3, 4, 7, 8, 9], 'node()');
  static anyPiTest = NodeTest.makeNodeTypeTest(NodeTest.PI, [7], 'processing-instruction()');

  type: number;

  constructor(type: number) {
    this.type = type;
  }

  toString(): string {
    return '<unknown nodetest type>';
  }

  matches(_n: Node, _xpc: XPathContext): boolean {
    // tslint:disable-next-line:no-console
    console.warn('unknown node test type');
    return false;
  }
}
