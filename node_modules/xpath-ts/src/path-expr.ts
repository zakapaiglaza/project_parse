import { XML_NAMESPACE_URI, XMLNS_NAMESPACE_URI } from './consts';
import { LocationPath } from './location-path';
import { Step } from './step';
import { isAttribute, isDocument, isElement } from './utils/types';
import { XPathNamespace } from './xpath-namespace';
import { Expression, XNodeSet, XNumber, XPathContext, XString } from './xpath-types';

export class PathExpr extends Expression {
  static predicateMatches(pred: Expression, c: XPathContext) {
    const res = pred.evaluate(c);

    return res instanceof XNumber ? c.contextPosition === res.numberValue : res.booleanValue;
  }

  static applyLocationPath(locationPath: LocationPath | undefined, xpc: XPathContext, nodes: Node[]) {
    if (!locationPath) {
      return nodes;
    }

    const startNodes = locationPath.absolute ? [PathExpr.getRoot(xpc, nodes)] : nodes;

    return PathExpr.applySteps(locationPath.steps, xpc, startNodes);
  }

  static applyStep(step: Step, xpc: XPathContext, node: Node): Node[] {
    const newNodes = [];
    xpc.contextNode = node;

    switch (step.axis) {
      case Step.ANCESTOR: {
        // look at all the ancestor nodes
        if (xpc.contextNode === xpc.virtualRoot) {
          break;
        }
        let m: Node | null;
        if (isAttribute(xpc.contextNode)) {
          m = PathExpr.getOwnerElement(xpc.contextNode);
        } else {
          m = xpc.contextNode.parentNode;
        }
        while (m != null) {
          if (step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
          if (m === xpc.virtualRoot) {
            break;
          }
          m = m.parentNode;
        }
        break;
      }
      case Step.ANCESTORORSELF: {
        // look at all the ancestor nodes and the current node
        for (
          let m: Node | null = xpc.contextNode;
          m != null;
          m = isAttribute(m) ? PathExpr.getOwnerElement(m) : m.parentNode
        ) {
          if (step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
          if (m === xpc.virtualRoot) {
            break;
          }
        }
        break;
      }
      case Step.ATTRIBUTE: {
        // look at the attributes
        const nnm = (xpc.contextNode as Element).attributes;
        if (nnm != null) {
          for (let k = 0; k < nnm.length; k++) {
            const m = nnm.item(k)!;
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
        }
        break;
      }
      case Step.CHILD: {
        // look at all child elements
        for (let m: Node | null = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
          if (step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
        }
        break;
      }
      case Step.DESCENDANT: {
        // look at all descendant nodes
        const st: Array<Node | null> = [xpc.contextNode.firstChild];
        while (st.length > 0) {
          for (let m = st.pop(); m != null; ) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m.firstChild != null) {
              st.push(m.nextSibling);
              m = m.firstChild;
            } else {
              m = m.nextSibling;
            }
          }
        }
        break;
      }
      case Step.DESCENDANTORSELF: {
        // look at self
        if (step.nodeTest.matches(xpc.contextNode, xpc)) {
          newNodes.push(xpc.contextNode);
        }
        // look at all descendant nodes
        const st: Array<Node | null> = [xpc.contextNode.firstChild];
        while (st.length > 0) {
          for (let m: Node | null = st.pop()!; m != null; ) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
            if (m.firstChild != null) {
              st.push(m.nextSibling);
              m = m.firstChild;
            } else {
              m = m.nextSibling;
            }
          }
        }
        break;
      }
      case Step.FOLLOWING: {
        if (xpc.contextNode === xpc.virtualRoot) {
          break;
        }

        for (let n: Node | null = xpc.contextNode; n != null; n = n.parentNode) {
          for (let m: Node | null = n.nextSibling; m != null; m = m.nextSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
        }

        break;
      }
      case Step.FOLLOWINGSIBLING: {
        if (xpc.contextNode === xpc.virtualRoot) {
          break;
        }
        for (let m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
          if (step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
        }
        break;
      }
      case Step.NAMESPACE: {
        const n: { [name: string]: string } = {};
        if (isElement(xpc.contextNode)) {
          n.xml = XML_NAMESPACE_URI;
          n.xmlns = XMLNS_NAMESPACE_URI;
          for (let m: Node | null = xpc.contextNode; m != null && isElement(m); m = m.parentNode) {
            for (let k = 0; k < m.attributes.length; k++) {
              const attr = m.attributes.item(k)!;
              const nm = String(attr.name);
              if (nm === 'xmlns') {
                if (n[''] === undefined) {
                  n[''] = attr.value;
                }
              } else if (nm.length > 6 && nm.substring(0, 6) === 'xmlns:') {
                const pre = nm.substring(6, nm.length);
                if (n[pre] === undefined) {
                  n[pre] = attr.value;
                }
              }
            }
          }

          // tslint:disable-next-line:forin
          for (const pre in n) {
            const nsn = new XPathNamespace(pre, n[pre], xpc.contextNode);
            if (step.nodeTest.matches(nsn, xpc)) {
              newNodes.push(nsn);
            }
          }
        }
        break;
      }
      case Step.PARENT: {
        let m: Node | null = null;
        if (xpc.contextNode !== xpc.virtualRoot) {
          if (isAttribute(xpc.contextNode)) {
            m = PathExpr.getOwnerElement(xpc.contextNode);
          } else {
            m = xpc.contextNode.parentNode;
          }
        }
        if (m != null && step.nodeTest.matches(m, xpc)) {
          newNodes.push(m);
        }
        break;
      }
      case Step.PRECEDING: {
        if (xpc.contextNode === xpc.virtualRoot) {
          break;
        }

        for (let n: Node | null = xpc.contextNode; n != null; n = n.parentNode) {
          for (let m: Node | null = n.previousSibling; m != null; m = m.previousSibling) {
            if (step.nodeTest.matches(m, xpc)) {
              newNodes.push(m);
            }
          }
        }

        break;
      }
      case Step.PRECEDINGSIBLING: {
        if (xpc.contextNode === xpc.virtualRoot) {
          break;
        }
        for (let m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
          if (step.nodeTest.matches(m, xpc)) {
            newNodes.push(m);
          }
        }
        break;
      }
      case Step.SELF: {
        if (step.nodeTest.matches(xpc.contextNode, xpc)) {
          newNodes.push(xpc.contextNode);
        }
        break;
      }
      default:
    }

    return newNodes;
  }

  static getRoot(xpc: XPathContext, nodes: Node[]) {
    const firstNode = nodes[0];

    if (isDocument(firstNode)) {
      return firstNode;
    }

    if (xpc.virtualRoot) {
      return xpc.virtualRoot;
    }

    const ownerDoc = firstNode.ownerDocument;

    if (ownerDoc) {
      return ownerDoc;
    }

    // IE 5.5 doesn't have ownerDocument?
    let n = firstNode;
    while (n.parentNode != null) {
      n = n.parentNode;
    }
    return n;
  }

  static applySteps(steps: Step[], xpc: XPathContext, nodes: Node[]) {
    return steps.reduce((inNodes: Node[], step: Step) => {
      return inNodes
        .map((node) => {
          return PathExpr.applyPredicates(step.predicates, xpc, PathExpr.applyStep(step, xpc, node));
        })
        .flat();
    }, nodes);
  }

  static getOwnerElement(n: Attr) {
    if (n.ownerElement) {
      return n.ownerElement;
    }

    return null;
  }

  static applyPredicates(predicates: Expression[], c: XPathContext, nodes: Node[]) {
    return predicates.reduce((inNodes, pred) => {
      const ctx = c.extend({ contextSize: inNodes.length });

      return inNodes.filter((node: Node, i: number) => {
        return PathExpr.predicateMatches(pred, ctx.extend({ contextNode: node, contextPosition: i + 1 }));
      });
    }, nodes);
  }

  static predicateString = (e: Expression) => `[${e.toString()}]`;
  static predicatesString = (es: Expression[]) => es.map(PathExpr.predicateString).join('');

  filter?: Expression;
  filterPredicates?: Expression[];
  locationPath?: LocationPath;

  constructor(
    filter: Expression | undefined,
    filterPreds: Expression[] | undefined,
    locpath: LocationPath | undefined
  ) {
    super();

    this.filter = filter;
    this.filterPredicates = filterPreds;
    this.locationPath = locpath;
  }

  applyFilter(c: XPathContext, xpc: XPathContext) {
    if (!this.filter) {
      return { nodes: [c.contextNode!] };
    }

    const ns = this.filter.evaluate(c);

    if (!(ns instanceof XNodeSet)) {
      if ((this.filterPredicates != null && this.filterPredicates.length > 0) || this.locationPath != null) {
        throw new Error('Path expression filter must evaluate to a nodeset if predicates or location path are used');
      }

      return { nonNodes: ns };
    }

    return {
      nodes: PathExpr.applyPredicates(this.filterPredicates || [], xpc, ns.toUnsortedArray())
    };
  }

  evaluate(c: XPathContext) {
    const xpc = c.clone();

    const filterResult = this.applyFilter(c, xpc);

    if (filterResult.nonNodes !== undefined) {
      return filterResult.nonNodes;
    }

    // filterResult.nodes is defined because nonNodes is not
    const ns = new XNodeSet();
    ns.addArray(PathExpr.applyLocationPath(this.locationPath, xpc, filterResult.nodes!));
    return ns;
  }

  toString() {
    if (this.filter !== undefined) {
      const filterStr = this.filter.toString();

      if (this.filter instanceof XString) {
        return `'${filterStr}'`;
      }
      if (this.filterPredicates !== undefined && this.filterPredicates.length) {
        return `(${filterStr})` + PathExpr.predicatesString(this.filterPredicates);
      }
      if (this.locationPath !== undefined) {
        return filterStr + (this.locationPath.absolute ? '' : '/') + this.locationPath.toString();
      }

      return filterStr;
    }

    if (this.locationPath !== undefined) {
      return this.locationPath.toString();
    } else {
      return '<Empty PathExpr>';
    }
  }
}
