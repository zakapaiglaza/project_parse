import { XPathException } from './xpath-exception';
import { Expression, XBoolean, XNodeSet, XNumber, XString } from './xpath-types';

export class XPathResultImpl implements XPathResult {
  static readonly ANY_TYPE = 0;
  static NUMBER_TYPE = 1;
  static STRING_TYPE = 2;
  static BOOLEAN_TYPE = 3;
  static UNORDERED_NODE_ITERATOR_TYPE = 4;
  static ORDERED_NODE_ITERATOR_TYPE = 5;
  static UNORDERED_NODE_SNAPSHOT_TYPE = 6;
  static ORDERED_NODE_SNAPSHOT_TYPE = 7;
  static ANY_UNORDERED_NODE_TYPE = 8;
  static FIRST_ORDERED_NODE_TYPE = 9;

  resultType: number;
  numberValue: number;
  stringValue: string;
  booleanValue: boolean;

  nodes: Node[];
  singleNodeValue: Node;
  invalidIteratorState: boolean;
  iteratorIndex: number;
  snapshotLength: number;

  ANY_TYPE = XPathResultImpl.ANY_TYPE;
  NUMBER_TYPE = XPathResultImpl.NUMBER_TYPE;
  STRING_TYPE = XPathResultImpl.STRING_TYPE;
  BOOLEAN_TYPE = XPathResultImpl.BOOLEAN_TYPE;
  UNORDERED_NODE_ITERATOR_TYPE = XPathResultImpl.UNORDERED_NODE_ITERATOR_TYPE;
  ORDERED_NODE_ITERATOR_TYPE = XPathResultImpl.ORDERED_NODE_ITERATOR_TYPE;
  UNORDERED_NODE_SNAPSHOT_TYPE = XPathResultImpl.UNORDERED_NODE_SNAPSHOT_TYPE;
  ORDERED_NODE_SNAPSHOT_TYPE = XPathResultImpl.ORDERED_NODE_SNAPSHOT_TYPE;
  ANY_UNORDERED_NODE_TYPE = XPathResultImpl.ANY_UNORDERED_NODE_TYPE;
  FIRST_ORDERED_NODE_TYPE = XPathResultImpl.FIRST_ORDERED_NODE_TYPE;

  constructor(v: Expression, t: number) {
    if (t === XPathResultImpl.ANY_TYPE) {
      if (v instanceof XString) {
        t = XPathResultImpl.STRING_TYPE;
      } else if (v instanceof XNumber) {
        t = XPathResultImpl.NUMBER_TYPE;
      } else if (v instanceof XBoolean) {
        t = XPathResultImpl.BOOLEAN_TYPE;
      } else if (v instanceof XNodeSet) {
        t = XPathResultImpl.UNORDERED_NODE_ITERATOR_TYPE;
      }
    }
    this.resultType = t;
    switch (t) {
      case XPathResultImpl.NUMBER_TYPE:
        this.numberValue = v.numberValue;
        this.stringValue = v.stringValue;
        this.booleanValue = v.booleanValue;
        return;
      case XPathResultImpl.STRING_TYPE:
        this.numberValue = v.numberValue;
        this.stringValue = v.stringValue;
        this.booleanValue = v.booleanValue;
        return;
      case XPathResultImpl.BOOLEAN_TYPE:
        this.numberValue = v.numberValue;
        this.stringValue = v.stringValue;
        this.booleanValue = v.booleanValue;
        return;
      case XPathResultImpl.ANY_UNORDERED_NODE_TYPE:
      case XPathResultImpl.FIRST_ORDERED_NODE_TYPE:
        if (v instanceof XNodeSet) {
          const first = v.first();

          this.singleNodeValue = first as never;
          this.numberValue = v.numberValue;
          this.stringValue = v.stringValue;
          this.booleanValue = v.booleanValue;
          this.nodes = first != null ? [first] : [];

          return;
        }
        break;
      case XPathResultImpl.UNORDERED_NODE_ITERATOR_TYPE:
      case XPathResultImpl.ORDERED_NODE_ITERATOR_TYPE:
        if (v instanceof XNodeSet) {
          this.invalidIteratorState = false;
          this.nodes = v.toArray();
          this.iteratorIndex = 0;
          this.numberValue = v.numberValue;
          this.stringValue = v.stringValue;
          this.booleanValue = v.booleanValue;
          return;
        }
        break;
      case XPathResultImpl.UNORDERED_NODE_SNAPSHOT_TYPE:
      case XPathResultImpl.ORDERED_NODE_SNAPSHOT_TYPE:
        if (v instanceof XNodeSet) {
          this.nodes = v.toArray();
          this.snapshotLength = this.nodes.length;
          this.numberValue = v.numberValue;
          this.stringValue = v.stringValue;
          this.booleanValue = v.booleanValue;
          return;
        }
        break;
    }
    throw new XPathException(XPathException.TYPE_ERR);
  }

  iterateNext() {
    if (
      this.resultType !== XPathResultImpl.UNORDERED_NODE_ITERATOR_TYPE &&
      this.resultType !== XPathResultImpl.ORDERED_NODE_ITERATOR_TYPE
    ) {
      throw new XPathException(XPathException.TYPE_ERR);
    }

    if (this.iteratorIndex === this.nodes.length) {
      return null as never;
    }

    return this.nodes[this.iteratorIndex++];
  }

  snapshotItem(i: number) {
    if (
      this.resultType !== XPathResultImpl.UNORDERED_NODE_SNAPSHOT_TYPE &&
      this.resultType !== XPathResultImpl.ORDERED_NODE_SNAPSHOT_TYPE
    ) {
      throw new XPathException(XPathException.TYPE_ERR);
    }
    return this.nodes[i];
  }
}
