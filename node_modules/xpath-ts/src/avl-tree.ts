import { isAttribute } from './utils/types';

// tslint:disable:no-bitwise

export class AVLTree {
  left: AVLTree | null;
  right: AVLTree | null;
  node: Node;
  depth: number;

  constructor(n: Node) {
    this.left = null;
    this.right = null;
    this.node = n;
    this.depth = 1;
  }

  balance() {
    const ldepth = this.left == null ? 0 : this.left.depth;
    const rdepth = this.right == null ? 0 : this.right.depth;

    if (ldepth > rdepth + 1) {
      // LR or LL rotation
      const lldepth = this.left!.left == null ? 0 : this.left!.left!.depth;
      const lrdepth = this.left!.right == null ? 0 : this.left!.right!.depth;

      if (lldepth < lrdepth) {
        // LR rotation consists of a RR rotation of the left child
        this.left!.rotateRR();
        // plus a LL rotation of this node, which happens anyway
      }
      this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
      // RR or RL rorarion
      const rrdepth = this.right!.right == null ? 0 : this.right!.right!.depth;
      const rldepth = this.right!.left == null ? 0 : this.right!.left!.depth;

      if (rldepth > rrdepth) {
        // RR rotation consists of a LL rotation of the right child
        this.right!.rotateLL();
        // plus a RR rotation of this node, which happens anyway
      }
      this.rotateRR();
    }
  }

  rotateLL() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    const nodeBefore = this.node;
    const rightBefore = this.right;
    this.node = this.left!.node;
    this.right = this.left;
    this.left = this.left!.left;
    this.right!.left = this.right!.right;
    this.right!.right = rightBefore;
    this.right!.node = nodeBefore;
    this.right!.updateInNewLocation();
    this.updateInNewLocation();
  }

  rotateRR() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    const nodeBefore = this.node;
    const leftBefore = this.left;
    this.node = this.right!.node;
    this.left = this.right!;
    this.right = this.right!.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
  }

  updateInNewLocation() {
    this.getDepthFromChildren();
  }

  getDepthFromChildren() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
      this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
      this.depth = this.right.depth + 1;
    }
  }

  add(n: Node): boolean {
    if (n === this.node) {
      return false;
    }

    const o = nodeOrder(n, this.node);

    let ret = false;
    if (o === -1) {
      if (this.left == null) {
        this.left = new AVLTree(n);
        ret = true;
      } else {
        ret = this.left.add(n);
        if (ret) {
          this.balance();
        }
      }
    } else if (o === 1) {
      if (this.right == null) {
        this.right = new AVLTree(n);
        ret = true;
      } else {
        ret = this.right.add(n);
        if (ret) {
          this.balance();
        }
      }
    }

    if (ret) {
      this.getDepthFromChildren();
    }
    return ret;
  }
}

function nodeOrder(n1: Node, n2: Node) {
  if (n1 === n2) {
    return 0;
  }

  if (n1.compareDocumentPosition !== undefined && n2.compareDocumentPosition !== undefined) {
    try {
      const cpos = n1.compareDocumentPosition(n2);

      if (cpos & 0x01) {
        // not in the same document; return an arbitrary result (is there a better way to do this)
        return 1;
      }
      if (cpos & 0x0a) {
        // n2 precedes or contains n1
        return 1;
      }
      if (cpos & 0x14) {
        // n2 follows or is contained by n1
        return -1;
      }

      return 0;
    } catch (_e) {
      // if compareDocumentPosition exists but is not supported ignore error
    }
  }

  let d1 = 0;
  let d2 = 0;
  for (let m1: Node | null = n1; m1 != null; m1 = parentNode(m1)) {
    d1++;
  }
  for (let m2: Node | null = n2; m2 != null; m2 = parentNode(m2)) {
    d2++;
  }

  // step up to same depth
  if (d1 > d2) {
    while (d1 > d2) {
      n1 = parentNode(n1)!;
      d1--;
    }
    if (n1 === n2) {
      return 1;
    }
  } else if (d2 > d1) {
    while (d2 > d1) {
      n2 = parentNode(n2)!;
      d2--;
    }
    if (n1 === n2) {
      return -1;
    }
  }

  let n1Par = parentNode(n1);
  let n2Par = parentNode(n2);

  // find common parent
  while (n1Par !== n2Par) {
    n1 = n1Par!;
    n2 = n2Par!;
    n1Par = parentNode(n1);
    n2Par = parentNode(n2);
  }

  const n1isAttr = isAttribute(n1);
  const n2isAttr = isAttribute(n2);

  if (n1isAttr && !n2isAttr) {
    return -1;
  }
  if (!n1isAttr && n2isAttr) {
    return 1;
  }

  if (n1Par) {
    const cn = n1isAttr ? (n1Par as Element).attributes : n1Par.childNodes;
    const len = cn.length;
    for (let i = 0; i < len; i += 1) {
      const n = cn[i];
      if (n === n1) {
        return -1;
      }
      if (n === n2) {
        return 1;
      }
    }
  }

  throw new Error('Unexpected: could not determine node order');
}

function parentNode(n: Node) {
  if (isAttribute(n)) {
    return n.ownerElement;
  } else {
    return n.parentNode;
  }
}
