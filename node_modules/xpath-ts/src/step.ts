import { NodeTest } from './node-test';
import { Expression } from './xpath-types';

export class Step {
  static ANCESTOR = 0;
  static ANCESTORORSELF = 1;
  static ATTRIBUTE = 2;
  static CHILD = 3;
  static DESCENDANT = 4;
  static DESCENDANTORSELF = 5;
  static FOLLOWING = 6;
  static FOLLOWINGSIBLING = 7;
  static NAMESPACE = 8;
  static PARENT = 9;
  static PRECEDING = 10;
  static PRECEDINGSIBLING = 11;
  static SELF = 12;

  static STEPNAMES = ([
    [Step.ANCESTOR, 'ancestor'],
    [Step.ANCESTORORSELF, 'ancestor-or-self'],
    [Step.ATTRIBUTE, 'attribute'],
    [Step.CHILD, 'child'],
    [Step.DESCENDANT, 'descendant'],
    [Step.DESCENDANTORSELF, 'descendant-or-self'],
    [Step.FOLLOWING, 'following'],
    [Step.FOLLOWINGSIBLING, 'following-sibling'],
    [Step.NAMESPACE, 'namespace'],
    [Step.PARENT, 'parent'],
    [Step.PRECEDING, 'preceding'],
    [Step.PRECEDINGSIBLING, 'preceding-sibling'],
    [Step.SELF, 'self']
  ] as Array<[number, string]>).reduce(
    (acc, x) => {
      return (acc[x[0]] = x[1]), acc;
    },
    {} as { [key: number]: string }
  );

  static predicateString = (e: Expression) => `[${e.toString()}]`;
  static predicatesString = (es: Expression[]) => es.map(Step.predicateString).join('');

  axis: number;
  nodeTest: NodeTest;
  predicates: Expression[];

  constructor(axis: number, nodetest: NodeTest, preds: Expression[]) {
    this.axis = axis;
    this.nodeTest = nodetest;
    this.predicates = preds;
  }

  toString() {
    return Step.STEPNAMES[this.axis] + '::' + this.nodeTest.toString() + Step.predicatesString(this.predicates);
  }
}
