import { FunctionCall } from './function-call';
import { LocationPath } from './location-path';
import { NodeTest } from './node-test';
import { AndOperation } from './operations/and-operation';
import { BarOperation } from './operations/bar-operation';
import { DivOperation } from './operations/div-operation';
import { EqualsOperation } from './operations/equals-operation';
import { GreaterThanOperation } from './operations/greater-than-operation';
import { GreaterThanOrEqualOperation } from './operations/greater-than-or-equal-operation';
import { LessThanOperation } from './operations/less-than-operation';
import { LessThanOrEqualOperation } from './operations/less-than-or-equal-operation';
import { MinusOperation } from './operations/minus-operation';
import { ModOperation } from './operations/mod-operation';
import { MultiplyOperation } from './operations/multiply-operation';
import { NotEqualOperation } from './operations/not-equals-operation';
import { OrOperation } from './operations/or-operation';
import { PlusOperation } from './operations/plus-operation';
import { UnaryMinusOperation } from './operations/unary-minus-operation';
import { PathExpr } from './path-expr';
import { Step } from './step';
import { isLetter, isNCNameChar } from './utils/character';
import { VariableReference } from './variable-reference';
import { XPath } from './xpath';
import { XPathException } from './xpath-exception';
import { Expression, XNumber, XString } from './xpath-types';

// tslint:disable:quotemark

export class XPathParser {
  static actionTable = [
    ' s s        sssssssss    s ss  s  ss',
    '                 s                  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    '                rrrrr               ',
    ' s s        sssssssss    s ss  s  ss',
    'rs  rrrrrrrr s  sssssrrrrrr  rrs rs ',
    ' s s        sssssssss    s ss  s  ss',
    '                            s       ',
    '                            s       ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    '  s                                 ',
    '                            s       ',
    ' s           s  sssss          s  s ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'a                                   ',
    'r       s                    rr  r  ',
    'r      sr                    rr  r  ',
    'r   s  rr            s       rr  r  ',
    'r   rssrr            rss     rr  r  ',
    'r   rrrrr            rrrss   rr  r  ',
    'r   rrrrrsss         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrrs  rr  r  ',
    'r   rrrrrrrr         rrrrrr  rr  r  ',
    'r   rrrrrrrr         rrrrrr  rr  r  ',
    'r  srrrrrrrr         rrrrrrs rr sr  ',
    'r  srrrrrrrr         rrrrrrs rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r   rrrrrrrr         rrrrrr  rr  r  ',
    'r   rrrrrrrr         rrrrrr  rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    '                sssss               ',
    'r  rrrrrrrrr         rrrrrrr rr sr  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    '                             s      ',
    'r  srrrrrrrr         rrrrrrs rr  r  ',
    'r   rrrrrrrr         rrrrr   rr  r  ',
    '              s                     ',
    '                             s      ',
    '                rrrrr               ',
    ' s s        sssssssss    s sss s  ss',
    'r  srrrrrrrr         rrrrrrs rr  r  ',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s s        sssssssss      ss  s  ss',
    ' s s        sssssssss    s ss  s  ss',
    ' s           s  sssss          s  s ',
    ' s           s  sssss          s  s ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    ' s           s  sssss          s  s ',
    ' s           s  sssss          s  s ',
    'r  rrrrrrrrr         rrrrrrr rr sr  ',
    'r  rrrrrrrrr         rrrrrrr rr sr  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    '                             s      ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    '                             rr     ',
    '                             s      ',
    '                             rs     ',
    'r      sr                    rr  r  ',
    'r   s  rr            s       rr  r  ',
    'r   rssrr            rss     rr  r  ',
    'r   rssrr            rss     rr  r  ',
    'r   rrrrr            rrrss   rr  r  ',
    'r   rrrrr            rrrss   rr  r  ',
    'r   rrrrr            rrrss   rr  r  ',
    'r   rrrrr            rrrss   rr  r  ',
    'r   rrrrrsss         rrrrr   rr  r  ',
    'r   rrrrrsss         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrr   rr  r  ',
    'r   rrrrrrrr         rrrrrr  rr  r  ',
    '                                 r  ',
    '                                 s  ',
    'r  srrrrrrrr         rrrrrrs rr  r  ',
    'r  srrrrrrrr         rrrrrrs rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr  r  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    ' s s        sssssssss    s ss  s  ss',
    'r  rrrrrrrrr         rrrrrrr rr rr  ',
    '                             r      '
  ];

  static actionTableNumber = [
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    '                 J                  ',
    'a  aaaaaaaaa         aaaaaaa aa  a  ',
    '                YYYYY               ',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    'K1  KKKKKKKK .  +*)(\'KKKKKK  KK# K" ',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    '                            N       ',
    '                            O       ',
    'e  eeeeeeeee         eeeeeee ee ee  ',
    'f  fffffffff         fffffff ff ff  ',
    'd  ddddddddd         ddddddd dd dd  ',
    'B  BBBBBBBBB         BBBBBBB BB BB  ',
    'A  AAAAAAAAA         AAAAAAA AA AA  ',
    '  P                                 ',
    '                            Q       ',
    ' 1           .  +*)(\'          #  " ',
    'b  bbbbbbbbb         bbbbbbb bb  b  ',
    '                                    ',
    '!       S                    !!  !  ',
    '"      T"                    ""  "  ',
    '$   V  $$            U       $$  $  ',
    '&   &ZY&&            &XW     &&  &  ',
    ')   )))))            )))\\[   ))  )  ',
    '.   ....._^]         .....   ..  .  ',
    '1   11111111         11111   11  1  ',
    '5   55555555         55555`  55  5  ',
    '7   77777777         777777  77  7  ',
    '9   99999999         999999  99  9  ',
    ':  c::::::::         ::::::b :: a:  ',
    'I  fIIIIIIII         IIIIIIe II  I  ',
    '=  =========         ======= == ==  ',
    '?  ?????????         ??????? ?? ??  ',
    'C  CCCCCCCCC         CCCCCCC CC CC  ',
    'J   JJJJJJJJ         JJJJJJ  JJ  J  ',
    'M   MMMMMMMM         MMMMMM  MM  M  ',
    'N  NNNNNNNNN         NNNNNNN NN  N  ',
    'P  PPPPPPPPP         PPPPPPP PP  P  ',
    "                +*)('               ",
    'R  RRRRRRRRR         RRRRRRR RR aR  ',
    'U  UUUUUUUUU         UUUUUUU UU  U  ',
    'Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ',
    'c  ccccccccc         ccccccc cc cc  ',
    '                             j      ',
    'L  fLLLLLLLL         LLLLLLe LL  L  ',
    '6   66666666         66666   66  6  ',
    '              k                     ',
    '                             l      ',
    '                XXXXX               ',
    ' 1 0        /.-,+*)(\'    & %$m #  "!',
    '_  f________         ______e __  _  ',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1 0        /.-,+*)(\'      %$  #  "!',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ' 1           .  +*)(\'          #  " ',
    ' 1           .  +*)(\'          #  " ',
    '>  >>>>>>>>>         >>>>>>> >> >>  ',
    ' 1           .  +*)(\'          #  " ',
    ' 1           .  +*)(\'          #  " ',
    'Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ',
    'V  VVVVVVVVV         VVVVVVV VV aV  ',
    'T  TTTTTTTTT         TTTTTTT TT  T  ',
    '@  @@@@@@@@@         @@@@@@@ @@ @@  ',
    '                             \x87      ',
    '[  [[[[[[[[[         [[[[[[[ [[ [[  ',
    'D  DDDDDDDDD         DDDDDDD DD DD  ',
    '                             HH     ',
    '                             \x88      ',
    '                             F\x89     ',
    '#      T#                    ##  #  ',
    '%   V  %%            U       %%  %  ',
    "'   'ZY''            'XW     ''  '  ",
    '(   (ZY((            (XW     ((  (  ',
    '+   +++++            +++\\[   ++  +  ',
    '*   *****            ***\\[   **  *  ',
    '-   -----            ---\\[   --  -  ',
    ',   ,,,,,            ,,,\\[   ,,  ,  ',
    '0   00000_^]         00000   00  0  ',
    '/   /////_^]         /////   //  /  ',
    '2   22222222         22222   22  2  ',
    '3   33333333         33333   33  3  ',
    '4   44444444         44444   44  4  ',
    '8   88888888         888888  88  8  ',
    '                                 ^  ',
    '                                 \x8a  ',
    ';  f;;;;;;;;         ;;;;;;e ;;  ;  ',
    '<  f<<<<<<<<         <<<<<<e <<  <  ',
    'O  OOOOOOOOO         OOOOOOO OO  O  ',
    '`  `````````         ``````` ``  `  ',
    'S  SSSSSSSSS         SSSSSSS SS  S  ',
    'W  WWWWWWWWW         WWWWWWW WW  W  ',
    '\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ',
    'E  EEEEEEEEE         EEEEEEE EE EE  ',
    ' 1 0        /.-,+*)(\'    & %$  #  "!',
    ']  ]]]]]]]]]         ]]]]]]] ]] ]]  ',
    '                             G      '
  ];

  static gotoTable = [
    '3456789:;<=>?@ AB  CDEFGH IJ ',
    '                             ',
    '                             ',
    '                             ',
    'L456789:;<=>?@ AB  CDEFGH IJ ',
    '            M        EFGH IJ ',
    '       N;<=>?@ AB  CDEFGH IJ ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '            S        EFGH IJ ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '              e              ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                        h  J ',
    '              i          j   ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    'o456789:;<=>?@ ABpqCDEFGH IJ ',
    '                             ',
    '  r6789:;<=>?@ AB  CDEFGH IJ ',
    '   s789:;<=>?@ AB  CDEFGH IJ ',
    '    t89:;<=>?@ AB  CDEFGH IJ ',
    '    u89:;<=>?@ AB  CDEFGH IJ ',
    '     v9:;<=>?@ AB  CDEFGH IJ ',
    '     w9:;<=>?@ AB  CDEFGH IJ ',
    '     x9:;<=>?@ AB  CDEFGH IJ ',
    '     y9:;<=>?@ AB  CDEFGH IJ ',
    '      z:;<=>?@ AB  CDEFGH IJ ',
    '      {:;<=>?@ AB  CDEFGH IJ ',
    '       |;<=>?@ AB  CDEFGH IJ ',
    '       };<=>?@ AB  CDEFGH IJ ',
    '       ~;<=>?@ AB  CDEFGH IJ ',
    '         \x7f=>?@ AB  CDEFGH IJ ',
    '\x80456789:;<=>?@ AB  CDEFGH IJ\x81',
    '            \x82        EFGH IJ ',
    '            \x83        EFGH IJ ',
    '                             ',
    '                     \x84 GH IJ ',
    '                     \x85 GH IJ ',
    '              i          \x86   ',
    '              i          \x87   ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    'o456789:;<=>?@ AB\x8cqCDEFGH IJ ',
    '                             ',
    '                             '
  ];

  static productions = [
    [1, 1, 2],
    [2, 1, 3],
    [3, 1, 4],
    [3, 3, 3, -9, 4],
    [4, 1, 5],
    [4, 3, 4, -8, 5],
    [5, 1, 6],
    [5, 3, 5, -22, 6],
    [5, 3, 5, -5, 6],
    [6, 1, 7],
    [6, 3, 6, -23, 7],
    [6, 3, 6, -24, 7],
    [6, 3, 6, -6, 7],
    [6, 3, 6, -7, 7],
    [7, 1, 8],
    [7, 3, 7, -25, 8],
    [7, 3, 7, -26, 8],
    [8, 1, 9],
    [8, 3, 8, -12, 9],
    [8, 3, 8, -11, 9],
    [8, 3, 8, -10, 9],
    [9, 1, 10],
    [9, 2, -26, 9],
    [10, 1, 11],
    [10, 3, 10, -27, 11],
    [11, 1, 12],
    [11, 1, 13],
    [11, 3, 13, -28, 14],
    [11, 3, 13, -4, 14],
    [13, 1, 15],
    [13, 2, 13, 16],
    [15, 1, 17],
    [15, 3, -29, 2, -30],
    [15, 1, -15],
    [15, 1, -16],
    [15, 1, 18],
    [18, 3, -13, -29, -30],
    [18, 4, -13, -29, 19, -30],
    [19, 1, 20],
    [19, 3, 20, -31, 19],
    [20, 1, 2],
    [12, 1, 14],
    [12, 1, 21],
    [21, 1, -28],
    [21, 2, -28, 14],
    [21, 1, 22],
    [14, 1, 23],
    [14, 3, 14, -28, 23],
    [14, 1, 24],
    [23, 2, 25, 26],
    [23, 1, 26],
    [23, 3, 25, 26, 27],
    [23, 2, 26, 27],
    [23, 1, 28],
    [27, 1, 16],
    [27, 2, 16, 27],
    [25, 2, -14, -3],
    [25, 1, -32],
    [26, 1, 29],
    [26, 3, -20, -29, -30],
    [26, 4, -21, -29, -15, -30],
    [16, 3, -33, 30, -34],
    [30, 1, 2],
    [22, 2, -4, 14],
    [24, 3, 14, -4, 23],
    [28, 1, -35],
    [28, 1, -2],
    [17, 2, -36, -18],
    [29, 1, -17],
    [29, 1, -19],
    [29, 1, -18]
  ];

  static DOUBLEDOT = 2;
  static DOUBLECOLON = 3;
  static DOUBLESLASH = 4;
  static NOTEQUAL = 5;
  static LESSTHANOREQUAL = 6;
  static GREATERTHANOREQUAL = 7;
  static AND = 8;
  static OR = 9;
  static MOD = 10;
  static DIV = 11;
  static MULTIPLYOPERATOR = 12;
  static FUNCTIONNAME = 13;
  static AXISNAME = 14;
  static LITERAL = 15;
  static NUMBER = 16;
  static ASTERISKNAMETEST = 17;
  static QNAME = 18;
  static NCNAMECOLONASTERISK = 19;
  static NODETYPE = 20;
  static PROCESSINGINSTRUCTIONWITHLITERAL = 21;
  static EQUALS = 22;
  static LESSTHAN = 23;
  static GREATERTHAN = 24;
  static PLUS = 25;
  static MINUS = 26;
  static BAR = 27;
  static SLASH = 28;
  static LEFTPARENTHESIS = 29;
  static RIGHTPARENTHESIS = 30;
  static COMMA = 31;
  static AT = 32;
  static LEFTBRACKET = 33;
  static RIGHTBRACKET = 34;
  static DOT = 35;
  static DOLLAR = 36;

  static SHIFT = 's';
  static REDUCE = 'r';
  static ACCEPT = 'a';

  reduceActions: Array<(rhs: any[]) => any>;

  constructor() {
    this.reduceActions = [];

    this.reduceActions[3] = (rhs) => {
      return new OrOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[5] = (rhs) => {
      return new AndOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[7] = (rhs) => {
      return new EqualsOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[8] = (rhs) => {
      return new NotEqualOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[10] = (rhs) => {
      return new LessThanOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[11] = (rhs) => {
      return new GreaterThanOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[12] = (rhs) => {
      return new LessThanOrEqualOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[13] = (rhs) => {
      return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[15] = (rhs) => {
      return new PlusOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[16] = (rhs) => {
      return new MinusOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[18] = (rhs) => {
      return new MultiplyOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[19] = (rhs) => {
      return new DivOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[20] = (rhs) => {
      return new ModOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[22] = (rhs) => {
      return new UnaryMinusOperation(rhs[1]);
    };
    this.reduceActions[24] = (rhs) => {
      return new BarOperation(rhs[0], rhs[2]);
    };
    this.reduceActions[25] = (rhs) => {
      return new PathExpr(undefined, undefined, rhs[0]);
    };
    this.reduceActions[27] = (rhs) => {
      rhs[0].locationPath = rhs[2];
      return rhs[0];
    };
    this.reduceActions[28] = (rhs) => {
      rhs[0].locationPath = rhs[2];
      rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
      return rhs[0];
    };
    this.reduceActions[29] = (rhs) => {
      return new PathExpr(rhs[0], [], undefined);
    };
    this.reduceActions[30] = (rhs) => {
      if (rhs[0] instanceof PathExpr) {
        if (rhs[0].filterPredicates === undefined) {
          rhs[0].filterPredicates = [];
        }
        rhs[0].filterPredicates.push(rhs[1]);
        return rhs[0];
      } else {
        return new PathExpr(rhs[0], [rhs[1]], undefined);
      }
    };
    this.reduceActions[32] = (rhs) => {
      return rhs[1];
    };
    this.reduceActions[33] = (rhs) => {
      return new XString(rhs[0]);
    };
    this.reduceActions[34] = (rhs) => {
      return new XNumber(rhs[0]);
    };
    this.reduceActions[36] = (rhs) => {
      return new FunctionCall(rhs[0], []);
    };
    this.reduceActions[37] = (rhs) => {
      return new FunctionCall(rhs[0], rhs[2]);
    };
    this.reduceActions[38] = (rhs) => {
      return [rhs[0]];
    };
    this.reduceActions[39] = (rhs) => {
      rhs[2].unshift(rhs[0]);
      return rhs[2];
    };
    this.reduceActions[43] = (_rhs) => {
      return new LocationPath(true, []);
    };
    this.reduceActions[44] = (rhs) => {
      rhs[1].absolute = true;
      return rhs[1];
    };
    this.reduceActions[46] = (rhs) => {
      return new LocationPath(false, [rhs[0]]);
    };
    this.reduceActions[47] = (rhs) => {
      rhs[0].steps.push(rhs[2]);
      return rhs[0];
    };
    this.reduceActions[49] = (rhs) => {
      return new Step(rhs[0], rhs[1], []);
    };
    this.reduceActions[50] = (rhs) => {
      return new Step(Step.CHILD, rhs[0], []);
    };
    this.reduceActions[51] = (rhs) => {
      return new Step(rhs[0], rhs[1], rhs[2]);
    };
    this.reduceActions[52] = (rhs) => {
      return new Step(Step.CHILD, rhs[0], rhs[1]);
    };
    this.reduceActions[54] = (rhs) => {
      return [rhs[0]];
    };
    this.reduceActions[55] = (rhs) => {
      rhs[1].unshift(rhs[0]);
      return rhs[1];
    };
    this.reduceActions[56] = (rhs) => {
      if (rhs[0] === 'ancestor') {
        return Step.ANCESTOR;
      } else if (rhs[0] === 'ancestor-or-self') {
        return Step.ANCESTORORSELF;
      } else if (rhs[0] === 'attribute') {
        return Step.ATTRIBUTE;
      } else if (rhs[0] === 'child') {
        return Step.CHILD;
      } else if (rhs[0] === 'descendant') {
        return Step.DESCENDANT;
      } else if (rhs[0] === 'descendant-or-self') {
        return Step.DESCENDANTORSELF;
      } else if (rhs[0] === 'following') {
        return Step.FOLLOWING;
      } else if (rhs[0] === 'following-sibling') {
        return Step.FOLLOWINGSIBLING;
      } else if (rhs[0] === 'namespace') {
        return Step.NAMESPACE;
      } else if (rhs[0] === 'parent') {
        return Step.PARENT;
      } else if (rhs[0] === 'preceding') {
        return Step.PRECEDING;
      } else if (rhs[0] === 'preceding-sibling') {
        return Step.PRECEDINGSIBLING;
      } else if (rhs[0] === 'self') {
        return Step.SELF;
      }
      return -1;
    };
    this.reduceActions[57] = (_rhs) => {
      return Step.ATTRIBUTE;
    };
    this.reduceActions[59] = (rhs) => {
      if (rhs[0] === 'comment') {
        return NodeTest.commentTest;
      } else if (rhs[0] === 'text') {
        return NodeTest.textTest;
      } else if (rhs[0] === 'processing-instruction') {
        return NodeTest.anyPiTest;
      } else if (rhs[0] === 'node') {
        return NodeTest.nodeTest;
      }
      return new NodeTest(-1);
    };
    this.reduceActions[60] = (rhs) => {
      return new NodeTest.PITest(rhs[2]);
    };
    this.reduceActions[61] = (rhs) => {
      return rhs[1];
    };
    this.reduceActions[63] = (rhs) => {
      rhs[1].absolute = true;
      rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
      return rhs[1];
    };
    this.reduceActions[64] = (rhs) => {
      rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
      rhs[0].steps.push(rhs[2]);
      return rhs[0];
    };
    this.reduceActions[65] = (_rhs) => {
      return new Step(Step.SELF, NodeTest.nodeTest, []);
    };
    this.reduceActions[66] = (_rhs) => {
      return new Step(Step.PARENT, NodeTest.nodeTest, []);
    };
    this.reduceActions[67] = (rhs) => {
      return new VariableReference(rhs[1]);
    };
    this.reduceActions[68] = (_rhs) => {
      return NodeTest.nameTestAny;
    };
    this.reduceActions[69] = (rhs) => {
      return new NodeTest.NameTestPrefixAny(rhs[0].split(':')[0]);
    };
    this.reduceActions[70] = (rhs) => {
      return new NodeTest.NameTestQName(rhs[0]);
    };
  }

  tokenize(s1: string): [number[], string[]] {
    const s = s1 + '\0';

    const types: number[] = [];
    const values: string[] = [];
    let pos = 0;
    let c = s.charAt(pos++);
    while (1) {
      while (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        c = s.charAt(pos++);
      }
      if (c === '\0' || pos >= s.length) {
        break;
      }

      if (c === '(') {
        types.push(XPathParser.LEFTPARENTHESIS);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === ')') {
        types.push(XPathParser.RIGHTPARENTHESIS);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '[') {
        types.push(XPathParser.LEFTBRACKET);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === ']') {
        types.push(XPathParser.RIGHTBRACKET);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '@') {
        types.push(XPathParser.AT);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === ',') {
        types.push(XPathParser.COMMA);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '|') {
        types.push(XPathParser.BAR);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '+') {
        types.push(XPathParser.PLUS);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '-') {
        types.push(XPathParser.MINUS);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '=') {
        types.push(XPathParser.EQUALS);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }
      if (c === '$') {
        types.push(XPathParser.DOLLAR);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }

      if (c === '.') {
        c = s.charAt(pos++);
        if (c === '.') {
          types.push(XPathParser.DOUBLEDOT);
          values.push('..');
          c = s.charAt(pos++);
          continue;
        }
        if (c >= '0' && c <= '9') {
          let num = '.' + c;
          c = s.charAt(pos++);
          while (c >= '0' && c <= '9') {
            num += c;
            c = s.charAt(pos++);
          }
          types.push(XPathParser.NUMBER);
          values.push(num);
          continue;
        }
        types.push(XPathParser.DOT);
        values.push('.');
        continue;
      }

      if (c === "'" || c === '"') {
        const delimiter = c;
        let literal = '';
        // tslint:disable-next-line:no-conditional-assignment
        while (pos < s.length && (c = s.charAt(pos)) !== delimiter) {
          literal += c;
          pos += 1;
        }
        if (c !== delimiter) {
          throw XPathException.fromMessage('Unterminated string literal: ' + delimiter + literal);
        }
        pos += 1;
        types.push(XPathParser.LITERAL);
        values.push(literal);
        c = s.charAt(pos++);
        continue;
      }

      if (c >= '0' && c <= '9') {
        let num = c;
        c = s.charAt(pos++);
        while (c >= '0' && c <= '9') {
          num += c;
          c = s.charAt(pos++);
        }
        if (c === '.') {
          if (s.charAt(pos) >= '0' && s.charAt(pos) <= '9') {
            num += c;
            num += s.charAt(pos++);
            c = s.charAt(pos++);
            while (c >= '0' && c <= '9') {
              num += c;
              c = s.charAt(pos++);
            }
          }
        }
        types.push(XPathParser.NUMBER);
        values.push(num);
        continue;
      }

      if (c === '*') {
        if (types.length > 0) {
          const last = types[types.length - 1];
          if (
            last !== XPathParser.AT &&
            last !== XPathParser.DOUBLECOLON &&
            last !== XPathParser.LEFTPARENTHESIS &&
            last !== XPathParser.LEFTBRACKET &&
            last !== XPathParser.AND &&
            last !== XPathParser.OR &&
            last !== XPathParser.MOD &&
            last !== XPathParser.DIV &&
            last !== XPathParser.MULTIPLYOPERATOR &&
            last !== XPathParser.SLASH &&
            last !== XPathParser.DOUBLESLASH &&
            last !== XPathParser.BAR &&
            last !== XPathParser.PLUS &&
            last !== XPathParser.MINUS &&
            last !== XPathParser.EQUALS &&
            last !== XPathParser.NOTEQUAL &&
            last !== XPathParser.LESSTHAN &&
            last !== XPathParser.LESSTHANOREQUAL &&
            last !== XPathParser.GREATERTHAN &&
            last !== XPathParser.GREATERTHANOREQUAL
          ) {
            types.push(XPathParser.MULTIPLYOPERATOR);
            values.push(c);
            c = s.charAt(pos++);
            continue;
          }
        }
        types.push(XPathParser.ASTERISKNAMETEST);
        values.push(c);
        c = s.charAt(pos++);
        continue;
      }

      if (c === ':') {
        if (s.charAt(pos) === ':') {
          types.push(XPathParser.DOUBLECOLON);
          values.push('::');
          pos++;
          c = s.charAt(pos++);
          continue;
        }
      }

      if (c === '/') {
        c = s.charAt(pos++);
        if (c === '/') {
          types.push(XPathParser.DOUBLESLASH);
          values.push('//');
          c = s.charAt(pos++);
          continue;
        }
        types.push(XPathParser.SLASH);
        values.push('/');
        continue;
      }

      if (c === '!') {
        if (s.charAt(pos) === '=') {
          types.push(XPathParser.NOTEQUAL);
          values.push('!=');
          pos++;
          c = s.charAt(pos++);
          continue;
        }
      }

      if (c === '<') {
        if (s.charAt(pos) === '=') {
          types.push(XPathParser.LESSTHANOREQUAL);
          values.push('<=');
          pos++;
          c = s.charAt(pos++);
          continue;
        }
        types.push(XPathParser.LESSTHAN);
        values.push('<');
        c = s.charAt(pos++);
        continue;
      }

      if (c === '>') {
        if (s.charAt(pos) === '=') {
          types.push(XPathParser.GREATERTHANOREQUAL);
          values.push('>=');
          pos++;
          c = s.charAt(pos++);
          continue;
        }
        types.push(XPathParser.GREATERTHAN);
        values.push('>');
        c = s.charAt(pos++);
        continue;
      }

      if (c === '_' || isLetter(c.charCodeAt(0))) {
        let name = c;
        c = s.charAt(pos++);
        while (isNCNameChar(c.charCodeAt(0))) {
          name += c;
          c = s.charAt(pos++);
        }
        if (types.length > 0) {
          const last = types[types.length - 1];
          if (
            last !== XPathParser.AT &&
            last !== XPathParser.DOUBLECOLON &&
            last !== XPathParser.LEFTPARENTHESIS &&
            last !== XPathParser.LEFTBRACKET &&
            last !== XPathParser.AND &&
            last !== XPathParser.OR &&
            last !== XPathParser.MOD &&
            last !== XPathParser.DIV &&
            last !== XPathParser.MULTIPLYOPERATOR &&
            last !== XPathParser.SLASH &&
            last !== XPathParser.DOUBLESLASH &&
            last !== XPathParser.BAR &&
            last !== XPathParser.PLUS &&
            last !== XPathParser.MINUS &&
            last !== XPathParser.EQUALS &&
            last !== XPathParser.NOTEQUAL &&
            last !== XPathParser.LESSTHAN &&
            last !== XPathParser.LESSTHANOREQUAL &&
            last !== XPathParser.GREATERTHAN &&
            last !== XPathParser.GREATERTHANOREQUAL
          ) {
            if (name === 'and') {
              types.push(XPathParser.AND);
              values.push(name);
              continue;
            }
            if (name === 'or') {
              types.push(XPathParser.OR);
              values.push(name);
              continue;
            }
            if (name === 'mod') {
              types.push(XPathParser.MOD);
              values.push(name);
              continue;
            }
            if (name === 'div') {
              types.push(XPathParser.DIV);
              values.push(name);
              continue;
            }
          }
        }
        if (c === ':') {
          if (s.charAt(pos) === '*') {
            types.push(XPathParser.NCNAMECOLONASTERISK);
            values.push(name + ':*');
            pos++;
            c = s.charAt(pos++);
            continue;
          }
          if (s.charAt(pos) === '_' || isLetter(s.charCodeAt(pos))) {
            name += ':';
            c = s.charAt(pos++);
            while (isNCNameChar(c.charCodeAt(0))) {
              name += c;
              c = s.charAt(pos++);
            }
            if (c === '(') {
              types.push(XPathParser.FUNCTIONNAME);
              values.push(name);
              continue;
            }
            types.push(XPathParser.QNAME);
            values.push(name);
            continue;
          }
          if (s.charAt(pos) === ':') {
            types.push(XPathParser.AXISNAME);
            values.push(name);
            continue;
          }
        }
        if (c === '(') {
          if (name === 'comment' || name === 'text' || name === 'node') {
            types.push(XPathParser.NODETYPE);
            values.push(name);
            continue;
          }
          if (name === 'processing-instruction') {
            if (s.charAt(pos) === ')') {
              types.push(XPathParser.NODETYPE);
            } else {
              types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
            }
            values.push(name);
            continue;
          }
          types.push(XPathParser.FUNCTIONNAME);
          values.push(name);
          continue;
        }
        types.push(XPathParser.QNAME);
        values.push(name);
        continue;
      }

      throw new Error('Unexpected character ' + c);
    }
    types.push(1);
    values.push('[EOF]');
    return [types, values];
  }

  parse(str: string): XPath {
    const res = this.tokenize(str);

    const types = res[0];
    const values = res[1];
    let tokenPos: number = 0;
    const state: number[] = [];
    const tokenType: number[] = [];
    const tokenValue: any[] = [];
    let s: number;
    let a: number;
    let t: string;

    state.push(0);
    tokenType.push(1);
    tokenValue.push('_S');

    a = types[tokenPos];
    t = values[tokenPos++];
    while (1) {
      s = state[state.length - 1];
      switch (XPathParser.actionTable[s].charAt(a - 1)) {
        case XPathParser.SHIFT:
          tokenType.push(-a);
          tokenValue.push(t);
          state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
          a = types[tokenPos];
          t = values[tokenPos++];
          break;
        case XPathParser.REDUCE:
          const num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
          const rhs: string[] = [];
          for (let i = 0; i < num; i++) {
            tokenType.pop();
            rhs.unshift(tokenValue.pop()!);
            state.pop();
          }
          const lastState = state[state.length - 1];
          tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
          if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] === undefined) {
            tokenValue.push(rhs[0]);
          } else {
            tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
          }
          state.push(
            XPathParser.gotoTable[lastState].charCodeAt(
              XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2
            ) - 33
          );
          break;
        case XPathParser.ACCEPT:
          const expr = tokenValue.pop();
          if (!(expr instanceof Expression)) {
            throw new Error('XPath parse error. Wrong result type.');
          }
          return new XPath(expr);
        default:
          throw new Error('XPath parse error');
      }
    }

    throw new Error('XPath parse error');
  }
}
