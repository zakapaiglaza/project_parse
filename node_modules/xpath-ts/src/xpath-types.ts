import { AVLTree } from './avl-tree';
import { isAttribute, isCData, isDocument, isElement, isFragment, isNamespaceNode, isText } from './utils/types';

// tslint:disable:prefer-for-of
// tslint:disable:member-ordering

export abstract class Expression {
  toString() {
    return '<Expression>';
  }

  evaluate(_c: XPathContext): Expression {
    throw new Error('Could not evaluate expression.');
  }

  get string(): XString {
    throw new Error('Could not evaluate expression.');
  }

  get number(): XNumber {
    throw new Error('Could not evaluate expression.');
  }

  get bool(): XBoolean {
    throw new Error('Could not evaluate expression.');
  }

  get nodeset(): XNodeSet {
    throw new Error('Could not evaluate expression.');
  }

  get stringValue(): string {
    throw new Error('Could not evaluate expression.');
  }

  get numberValue(): number {
    throw new Error('Could not evaluate expression.');
  }

  get booleanValue(): boolean {
    throw new Error('Could not evaluate expression.');
  }

  equals(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
  notequal(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
  lessthan(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
  greaterthan(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
  lessthanorequal(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
  greaterthanorequal(_r: Expression): XBoolean {
    throw new Error('Could not evaluate expression.');
  }
}

export class XBoolean extends Expression {
  static TRUE = new XBoolean(true);
  static FALSE = new XBoolean(false);

  b: boolean;

  constructor(b: any) {
    super();

    this.b = Boolean(b);
  }

  toString() {
    return this.b.toString();
  }

  evaluate(_c: XPathContext) {
    return this;
  }

  get string() {
    return new XString(this.b);
  }

  get number() {
    return new XNumber(this.b);
  }

  get bool() {
    return this;
  }

  get nodeset(): XNodeSet {
    throw new Error('Cannot convert boolean to nodeset');
  }

  get stringValue() {
    return this.string.stringValue;
  }

  get numberValue() {
    return this.number.numberValue;
  }

  get booleanValue() {
    return this.b;
  }

  not() {
    return new XBoolean(!this.b);
  }

  equals(r: Expression): XBoolean {
    if (r instanceof XString || r instanceof XNumber) {
      return this.equals(r.bool);
    } else if (r instanceof XNodeSet) {
      return r.compareWithBoolean(this, Operators.equals);
    } else if (r instanceof XBoolean) {
      return new XBoolean(this.b === r.b);
    } else {
      throw new Error('Unsupported type');
    }
  }

  notequal(r: Expression): XBoolean {
    if (r instanceof XString || r instanceof XNumber) {
      return this.notequal(r.bool);
    } else if (r instanceof XNodeSet) {
      return r.compareWithBoolean(this, Operators.notequal);
    } else if (r instanceof XBoolean) {
      return new XBoolean(this.b !== r.b);
    } else {
      throw new Error('Unsupported type');
    }
  }

  lessthan(r: Expression): XBoolean {
    return this.number.lessthan(r);
  }

  greaterthan(r: Expression): XBoolean {
    return this.number.greaterthan(r);
  }

  lessthanorequal(r: Expression): XBoolean {
    return this.number.lessthanorequal(r);
  }

  greaterthanorequal(r: Expression): XBoolean {
    return this.number.greaterthanorequal(r);
  }
}

export class XNumber extends Expression {
  num: number;
  constructor(n: any) {
    super();

    this.num = typeof n === 'string' ? this.parse(n) : Number(n);
  }

  get numberFormat() {
    return /^\s*-?[0-9]*\.?[0-9]+\s*$/;
  }

  parse(s: string) {
    // XPath representation of numbers is more restrictive than what Number() or parseFloat() allow
    return this.numberFormat.test(s) ? parseFloat(s) : Number.NaN;
  }

  toString() {
    const strValue = this.num.toString();

    if (strValue.indexOf('e-') !== -1) {
      return padSmallNumber(strValue);
    }

    if (strValue.indexOf('e') !== -1) {
      return padLargeNumber(strValue);
    }

    return strValue;
  }

  evaluate(_c: XPathContext) {
    return this;
  }

  get string() {
    return new XString(this.toString());
  }

  get number() {
    return this;
  }

  get bool() {
    return new XBoolean(this.num);
  }

  get nodeset(): XNodeSet {
    throw new Error('Cannot convert string to nodeset');
  }

  get stringValue() {
    return this.string.stringValue;
  }

  get numberValue() {
    return this.num;
  }

  get booleanValue() {
    return this.bool.booleanValue;
  }

  negate() {
    return new XNumber(-this.num);
  }

  equals(r: Expression): XBoolean {
    if (r instanceof XBoolean) {
      return this.bool.equals(r);
    } else if (r instanceof XString) {
      return this.string.equals(r);
    } else if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.equals);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num === r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  notequal(r: Expression): XBoolean {
    if (r instanceof XBoolean) {
      return this.bool.notequal(r);
    } else if (r instanceof XString) {
      return this.notequal(r.number);
    } else if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.notequal);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num !== r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  lessthan(r: Expression): XBoolean {
    if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.greaterthan);
    } else if (r instanceof XBoolean || r instanceof XString) {
      return this.lessthan(r.number);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num < r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  greaterthan(r: Expression): XBoolean {
    if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.lessthan);
    } else if (r instanceof XBoolean || r instanceof XString) {
      return this.greaterthan(r.number);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num > r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  lessthanorequal(r: Expression): XBoolean {
    if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.greaterthanorequal);
    } else if (r instanceof XBoolean || r instanceof XString) {
      return this.lessthanorequal(r.number);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num <= r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  greaterthanorequal(r: Expression): XBoolean {
    if (r instanceof XNodeSet) {
      return r.compareWithNumber(this, Operators.lessthanorequal);
    } else if (r instanceof XBoolean || r instanceof XString) {
      return this.greaterthanorequal(r.number);
    } else if (r instanceof XNumber) {
      return new XBoolean(this.num >= r.num);
    } else {
      throw new Error('Unsupported type');
    }
  }

  plus(r: XNumber) {
    return new XNumber(this.num + r.num);
  }

  minus(r: XNumber) {
    return new XNumber(this.num - r.num);
  }

  multiply(r: XNumber) {
    return new XNumber(this.num * r.num);
  }

  div(r: XNumber) {
    return new XNumber(this.num / r.num);
  }

  mod(r: XNumber) {
    return new XNumber(this.num % r.num);
  }
}

function padSmallNumber(numberStr: string) {
  const parts = numberStr.split('e-');
  let base = parts[0].replace('.', '');
  const exponent = Number(parts[1]);

  for (let i = 0; i < exponent - 1; i += 1) {
    base = '0' + base;
  }

  return '0.' + base;
}

function padLargeNumber(numberStr: string) {
  const parts = numberStr.split('e');
  let base = parts[0].replace('.', '');
  const exponent = Number(parts[1]);
  const zerosToAppend = exponent + 1 - base.length;

  for (let i = 0; i < zerosToAppend; i += 1) {
    base += '0';
  }

  return base;
}

export class XString extends Expression {
  str: string;
  constructor(s: any) {
    super();

    this.str = String(s);
  }

  toString() {
    return this.str;
  }

  evaluate(_c: XPathContext) {
    return this;
  }

  get string() {
    return this;
  }

  get number() {
    return new XNumber(this.str);
  }

  get bool() {
    return new XBoolean(this.str);
  }

  get nodeset(): XNodeSet {
    throw new Error('Cannot convert string to nodeset');
  }

  get stringValue() {
    return this.str;
  }

  get numberValue() {
    return this.number.numberValue;
  }

  get booleanValue() {
    return this.bool.booleanValue;
  }

  equals(r: Expression): XBoolean {
    if (r instanceof XBoolean) {
      return this.bool.equals(r);
    } else if (r instanceof XNumber) {
      return this.number.equals(r);
    } else if (r instanceof XNodeSet) {
      return r.compareWithString(this, Operators.equals);
    } else if (r instanceof XString) {
      return new XBoolean(this.str === r.str);
    } else {
      throw new Error('Unsupported type');
    }
  }

  notequal(r: Expression): XBoolean {
    if (r instanceof XBoolean) {
      return this.bool.notequal(r);
    } else if (r instanceof XNumber) {
      return this.number.notequal(r);
    } else if (r instanceof XNodeSet) {
      return r.compareWithString(this, Operators.notequal);
    } else if (r instanceof XString) {
      return new XBoolean(this.str !== r.str);
    } else {
      throw new Error('Unsupported type');
    }
  }

  lessthan(r: Expression): XBoolean {
    return this.number.lessthan(r);
  }

  greaterthan(r: Expression): XBoolean {
    return this.number.greaterthan(r);
  }

  lessthanorequal(r: Expression): XBoolean {
    return this.number.lessthanorequal(r);
  }

  greaterthanorequal(r: Expression): XBoolean {
    return this.number.greaterthanorequal(r);
  }
}

export class XNodeSet extends Expression {
  static compareWith(o: Operator) {
    return function(this: XNodeSet, r: Expression): XBoolean {
      if (r instanceof XString) {
        return this.compareWithString(r, o);
      } else if (r instanceof XNumber) {
        return this.compareWithNumber(r, o);
      } else if (r instanceof XBoolean) {
        return this.compareWithBoolean(r, o);
      } else if (r instanceof XNodeSet) {
        return this.compareWithNodeSet(r, o);
      } else {
        throw new Error('Unsupported type');
      }
    };
  }

  tree: AVLTree | null;
  nodes: Node[];
  size: number;

  constructor() {
    super();

    this.tree = null;
    this.nodes = [];
    this.size = 0;
  }

  toString() {
    const p = this.first();
    if (p == null) {
      return '';
    }
    return this.stringForNode(p) || '';
  }

  evaluate(_c: XPathContext) {
    return this;
  }

  get string() {
    return new XString(this.toString());
  }

  get stringValue() {
    return this.toString();
  }

  get number() {
    return new XNumber(this.string);
  }

  get numberValue() {
    return Number(this.string);
  }

  get bool() {
    return new XBoolean(this.booleanValue);
  }

  get booleanValue() {
    return !!this.size;
  }

  get nodeset() {
    return this;
  }

  stringForNode(n: Node) {
    if (isDocument(n) || isElement(n) || isFragment(n)) {
      return this.stringForContainerNode(n);
    } else if (isAttribute(n)) {
      return n.value || n.nodeValue || '';
    } else if (isNamespaceNode(n)) {
      return n.value;
    }
    return n.nodeValue || '';
  }

  stringForContainerNode(n: Node) {
    let s = '';
    for (let n2 = n.firstChild; n2 != null; n2 = n2.nextSibling as ChildNode) {
      if (isElement(n2) || isText(n2) || isCData(n2) || isDocument(n2) || isFragment(n2)) {
        s += this.stringForNode(n2);
      }
    }
    return s;
  }

  buildTree() {
    if (!this.tree && this.nodes.length) {
      this.tree = new AVLTree(this.nodes[0]);
      for (let i = 1; i < this.nodes.length; i += 1) {
        this.tree.add(this.nodes[i]);
      }
    }

    return this.tree;
  }

  first() {
    let p = this.buildTree();
    if (p == null) {
      return null;
    }
    while (p.left != null) {
      p = p.left;
    }
    return p.node;
  }

  add(n: Node) {
    for (let i = 0; i < this.nodes.length; i += 1) {
      if (n === this.nodes[i]) {
        return;
      }
    }

    this.tree = null;
    this.nodes.push(n);
    this.size += 1;
  }

  addArray(ns: Node[]) {
    const self = this;

    ns.forEach((x) => self.add(x));
  }

  /**
   * Returns an array of the node set's contents in document order
   */
  toArray() {
    const a: Node[] = [];
    this.toArrayRec(this.buildTree(), a);
    return a;
  }

  toArrayRec(t: AVLTree | null, a: Node[]) {
    if (t != null) {
      this.toArrayRec(t.left, a);
      a.push(t.node);
      this.toArrayRec(t.right, a);
    }
  }

  /**
   * Returns an array of the node set's contents in arbitrary order
   */
  toUnsortedArray() {
    return this.nodes.slice();
  }

  compareWithString(r: XString, o: Operator): XBoolean {
    const a = this.toUnsortedArray();
    for (let i = 0; i < a.length; i++) {
      const n = a[i];
      const l = new XString(this.stringForNode(n));
      const res = o(l, r);
      if (res.booleanValue) {
        return res;
      }
    }
    return new XBoolean(false);
  }

  compareWithNumber(r: XNumber, o: Operator): XBoolean {
    const a = this.toUnsortedArray();
    for (let i = 0; i < a.length; i++) {
      const n = a[i];
      const l = new XNumber(this.stringForNode(n));
      const res = o(l, r);
      if (res.booleanValue) {
        return res;
      }
    }
    return new XBoolean(false);
  }

  compareWithBoolean(r: XBoolean, o: Operator): XBoolean {
    return o(this.bool, r);
  }

  compareWithNodeSet(r: XNodeSet, o: Operator) {
    const arr = this.toUnsortedArray();
    const oInvert = (lop: Expression, rop: Expression) => {
      return o(rop, lop);
    };

    for (let i = 0; i < arr.length; i++) {
      const l = new XString(this.stringForNode(arr[i]));

      const res = r.compareWithString(l, oInvert);
      if (res.booleanValue) {
        return res;
      }
    }

    return new XBoolean(false);
  }

  equals = XNodeSet.compareWith(Operators.equals);
  notequal = XNodeSet.compareWith(Operators.notequal);
  lessthan = XNodeSet.compareWith(Operators.lessthan);
  greaterthan = XNodeSet.compareWith(Operators.greaterthan);
  lessthanorequal = XNodeSet.compareWith(Operators.lessthanorequal);
  greaterthanorequal = XNodeSet.compareWith(Operators.greaterthanorequal);

  union(r: XNodeSet) {
    const ns = new XNodeSet();
    ns.addArray(this.toUnsortedArray());
    ns.addArray(r.toUnsortedArray());
    return ns;
  }
}

export type FunctionType = (c: XPathContext, ...args: Expression[]) => Expression;

export interface FunctionResolver {
  getFunction(localName: string, namespace: string): FunctionType | undefined;
}

export interface VariableResolver {
  getVariable(ln: string, ns: string): Expression | null;
}

export interface NamespaceResolver {
  getNamespace(prefix: string, n: Node | null): string | null;
}

export class XPathContext {
  variableResolver: VariableResolver;
  namespaceResolver: NamespaceResolver;
  functionResolver: FunctionResolver;
  contextNode: Node;
  virtualRoot: Node | null;
  expressionContextNode: Node;
  isHtml: boolean;
  contextSize: number;
  contextPosition: number;
  allowAnyNamespaceForNoPrefix: boolean;
  caseInsensitive: boolean;

  constructor(vr: VariableResolver, nr: NamespaceResolver, fr: FunctionResolver) {
    this.variableResolver = vr;
    this.namespaceResolver = nr;
    this.functionResolver = fr;
    this.virtualRoot = null;
    this.contextSize = 0;
    this.contextPosition = 0;
  }

  clone() {
    return Object.assign(new XPathContext(this.variableResolver, this.namespaceResolver, this.functionResolver), this);
  }

  extend(newProps: { [P in keyof XPathContext]?: XPathContext[P] }): XPathContext {
    return Object.assign(
      new XPathContext(this.variableResolver, this.namespaceResolver, this.functionResolver),
      this,
      newProps
    );
  }
}

export type Operator = (l: Expression, r: Expression) => XBoolean;

export class Operators {
  static equals(l: Expression, r: Expression) {
    return l.equals(r);
  }

  static notequal(l: Expression, r: Expression) {
    return l.notequal(r);
  }

  static lessthan(l: Expression, r: Expression) {
    return l.lessthan(r);
  }

  static greaterthan(l: Expression, r: Expression) {
    return l.greaterthan(r);
  }

  static lessthanorequal(l: Expression, r: Expression) {
    return l.lessthanorequal(r);
  }

  static greaterthanorequal(l: Expression, r: Expression) {
    return l.greaterthanorequal(r);
  }
}
