import { expect } from 'chai';
import * as xpath from '../src';
import { isAttribute, isElement, isText } from '../src/utils/types';
import { XPathException } from '../src/xpath-exception';

// tslint:disable:max-line-length
// tslint:disable:quotemark
// tslint:disable:no-unused-expression

const xhtmlNs = 'http://www.w3.org/1999/xhtml';

export function executeTests(implName: string, dom: typeof DOMParser, useDom4: boolean) {
  describe(`XPath library tests for ${implName}`, () => {
    it('api', () => {
      expect(xpath.evaluate).to.exist;
      expect(xpath.select).to.exist;
      expect(xpath.parse).to.exist;
    });

    it('evaluate', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const result = xpath.evaluate('//title', doc, null, xpath.XPathResult.ANY_TYPE, null);
      const nodes = (result as xpath.XPathResult).nodes;

      expect((nodes[0] as Element).localName).to.equal('title');
      expect((nodes[0].firstChild as Text).data).to.equal('Harry Potter');
      expect(toString(nodes[0])).to.equal('<title>Harry Potter</title>');
    });

    it('select', () => {
      const xml =
        '<?book title="Harry Potter"?><?series title="Harry Potter"?><?series books="7"?><book><!-- This is a great book --><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const nodes = asNodes(xpath.select('//title', doc));
      expect((nodes[0] as Element).localName).to.equal('title');
      expect((nodes[0].firstChild as Text).data).to.equal('Harry Potter');
      expect(toString(nodes[0])).to.equal('<title>Harry Potter</title>');

      const nodes2 = asNodes(xpath.select('//node()', doc));
      expect(nodes2).to.have.length(7);

      const pis = asNodes(xpath.select("/processing-instruction('series')", doc));
      expect(pis).to.have.length(2);
      expect((pis[1] as Text).data).to.equal('books="7"');
    });

    it('select single node', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      expect((asNodes(xpath.select('//title[1]', doc))[0] as Element).localName).to.equal('title');
    });

    it('select text node', () => {
      const xml = '<book><title>Harry</title><title>Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      expect(xpath.select('local-name(/book)', doc)).to.equal('book');
      expect(toString(xpath.select('//title/text()', doc))).to.equal('Harry,Potter');
    });

    it('select number value', () => {
      const xml = '<book><title>Harry</title><title>Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      expect(xpath.select('count(//title)', doc)).to.eq(2);
    });

    it('select xpath with namespaces', () => {
      const xml = '<book><title xmlns="myns">Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const nodes = asNodes(xpath.select('//*[local-name(.)="title" and namespace-uri(.)="myns"]', doc));
      expect((nodes[0] as Element).localName).to.equal('title');
      expect(nodes[0].namespaceURI).to.equal('myns');

      const nodes2 = asNodes(xpath.select('/*/title', doc));
      expect(nodes2).to.have.length(0);
    });

    it('select xpath with namespaces, using a resolver', () => {
      const xml =
        '<book xmlns:testns="http://example.com/test" xmlns:otherns="http://example.com/other"><otherns:title>Narnia</otherns:title><testns:title>Harry Potter</testns:title><testns:field testns:type="author">JKR</testns:field></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const mappings: { [key: string]: string | null } = {
        testns: 'http://example.com/test'
      };
      const resolver = {
        mappings,
        lookupNamespaceURI(prefix: string) {
          return this.mappings[prefix];
        }
      };

      expect(asNodes(xpath.selectWithResolver('//testns:title/text()', doc, resolver))[0].nodeValue).to.equal(
        'Harry Potter'
      );
      expect(
        asNodes(xpath.selectWithResolver('//testns:field[@testns:type="author"]/text()', doc, resolver))[0].nodeValue
      ).to.equal('JKR');

      const nodes2 = asNodes(xpath.selectWithResolver('/*/testns:*', doc, resolver));
      expect(nodes2).to.have.length(2);
    });

    it('select xpath with namespaces, with default resolver', () => {
      const xml =
        '<book xmlns:testns="http://example.com/test" xmlns:otherns="http://example.com/other"><otherns:title>Narnia</otherns:title><testns:title>Harry Potter</testns:title><testns:field testns:type="author">JKR</testns:field></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const evaluator = new xpath.XPathEvaluator({});
      evaluator.createExpression('//testns:title/text()', null);

      expect(asNodes(xpath.select('//testns:title/text()', doc))[0].nodeValue).to.equal('Harry Potter');
      expect(asNodes(xpath.select('//testns:field[@testns:type="author"]/text()', doc))[0].nodeValue).to.equal('JKR');

      const nodes2 = asNodes(xpath.select('/*/testns:*', doc));
      expect(nodes2).to.have.length(2);
    });

    it('select xpath with default namespace, using a resolver', () => {
      const xml =
        '<book xmlns="http://example.com/test"><title>Harry Potter</title><field type="author">JKR</field></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const mappings: { [key: string]: string | null } = {
        testns: 'http://example.com/test'
      };

      const resolver = {
        mappings,
        lookupNamespaceURI(prefix: string) {
          return this.mappings[prefix];
        }
      };

      expect(asNodes(xpath.selectWithResolver('//testns:title/text()', doc, resolver))[0].nodeValue).to.equal(
        'Harry Potter'
      );
      expect(
        asNodes(xpath.selectWithResolver('//testns:field[@type="author"]/text()', doc, resolver))[0].nodeValue
      ).to.equal('JKR');
    });

    it('select xpath with namespaces, prefixes different in xml and xpath, using a resolver', () => {
      const xml =
        '<book xmlns:testns="http://example.com/test"><testns:title>Harry Potter</testns:title><testns:field testns:type="author">JKR</testns:field></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const mappings: { [key: string]: string | null } = {
        ns: 'http://example.com/test'
      };

      const resolver = {
        mappings,
        lookupNamespaceURI(prefix: string) {
          return this.mappings[prefix];
        }
      };

      expect(asNodes(xpath.selectWithResolver('//ns:title/text()', doc, resolver))[0].nodeValue).to.equal(
        'Harry Potter'
      );
      expect(
        asNodes(xpath.selectWithResolver('//ns:field[@ns:type="author"]/text()', doc, resolver))[0].nodeValue
      ).to.equal('JKR');
    });

    it('select xpath with namespaces, using namespace mappings', () => {
      const xml =
        '<book xmlns:testns="http://example.com/test"><testns:title>Harry Potter</testns:title><testns:field testns:type="author">JKR</testns:field></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const select = xpath.useNamespaces({ testns: 'http://example.com/test' });

      expect(asNodes(select('//testns:title/text()', doc))[0].nodeValue).to.equal('Harry Potter');
      expect(asNodes(select('//testns:field[@testns:type="author"]/text()', doc))[0].nodeValue).to.equal('JKR');
    });

    it('select attribute', () => {
      const xml = '<author name="J. K. Rowling"></author>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const author = (xpath.select1('/author/@name', doc) as Attr).value;
      expect(author).to.equal('J. K. Rowling');
    });

    it('select with multiple predicates', () => {
      const xml =
        '<characters><character name="Snape" sex="M" age="50" /><character name="McGonnagal" sex="F" age="65" /><character name="Harry" sex="M" age="14" /></characters>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const characters = asNodes(xpath.select('/*/character[@sex = "M"][@age > 40]/@name', doc));

      expect(characters).to.have.length(1);
      expect(characters[0].textContent).to.equal('Snape');
    });

    // https://github.com/goto100/xpath/issues/37
    it('select multiple attributes', () => {
      const xml = '<authors><author name="J. K. Rowling" /><author name="Saeed Akl" /></authors>';
      let doc = new dom().parseFromString(xml, 'text/xml');

      const authors = asNodes(xpath.select('/authors/author/@name', doc));
      expect(authors).to.have.length(2);
      expect((authors[0] as Attr).value).to.equal('J. K. Rowling');

      // https://github.com/goto100/xpath/issues/41
      doc = new dom().parseFromString(
        '<chapters><chapter v="1"/><chapter v="2"/><chapter v="3"/></chapters>',
        'text/xml'
      );
      const nodes = asNodes(xpath.select('/chapters/chapter/@v', doc));
      const values = nodes.map((n: Node) => {
        return (n as Attr).value;
      });

      expect(values).to.have.length(3);
      expect(values[0]).to.equal('1');
      expect(values[1]).to.equal('2');
      expect(values[2]).to.equal('3');
    });

    it('XPathException acts like Error', () => {
      expect(() => {
        xpath.evaluate('1', null as any, null, null as any, undefined as any);
      }).to.throw(XPathException);
    });

    it('string() with no arguments', () => {
      const doc = new dom().parseFromString('<book>Harry Potter</book>', 'text/xml');

      const rootElement = xpath.select1('/book', doc);
      expect(rootElement).to.exist;

      expect(xpath.select1('string()', doc)).to.equal('Harry Potter');
    });

    it('string value of document fragment', () => {
      const doc = new dom().parseFromString('<n />', 'text/xml');
      const docFragment = doc.createDocumentFragment();

      const el = doc.createElement('book');
      docFragment.appendChild(el);

      const testValue = 'Harry Potter';

      el.appendChild(doc.createTextNode(testValue));

      expect(xpath.select1('string()', docFragment)).to.equal(testValue);
    });

    it('compare string of a number with a number', () => {
      expect(xpath.select1('"000" = 0')).to.be.true;
      expect(xpath.select1('"45.0" = 45')).to.be.true;
    });

    it('string(boolean) is a string', () => {
      expect(typeof xpath.select1('string(true())')).to.equal('string');
      expect(typeof xpath.select1('string(false())')).to.equal('string');
      expect(typeof xpath.select1('string(1 = 2)')).to.equal('string');
      expect(xpath.select1('"true" = string(true())')).to.be.true;
    });

    it('string should downcast to boolean', () => {
      expect(xpath.select1('"false" = false()')).to.equal(false);
      expect(xpath.select1('"a" = true()')).to.equal(true);
      expect(xpath.select1('"" = false()')).to.equal(true);
    });

    it('string(number) is a string', () => {
      expect(typeof xpath.select1('string(45)')).to.equal('string');
      expect(xpath.select1('"45" = string(45)')).to.be.true;
    });

    it('correct string to number conversion', () => {
      expect(xpath.select1('number("45.200")')).to.equal(45.2);
      expect(xpath.select1('number("000055")')).to.equal(55.0);
      expect(xpath.select1('number("  65  ")')).to.equal(65.0);

      expect(xpath.select1('"" != 0')).to.equal(true);
      expect(xpath.select1('"" = 0')).to.equal(false);
      expect(xpath.select1('0 = ""')).to.equal(false);
      expect(xpath.select1('0 = "   "')).to.equal(false);

      expect(xpath.select('number("")') as number).to.be.NaN;
      expect(xpath.select('number("45.8g")') as number).to.be.NaN;
      expect(xpath.select('number("2e9")') as number).to.be.NaN;
      expect(xpath.select('number("+33")') as number).to.be.NaN;
    });

    it('correct number to string conversion', () => {
      expect(xpath.parse('0.525 div 1000000 div 1000000 div 1000000 div 1000000').evaluateString()).to.equal(
        '0.0000000000000000000000005250000000000001'
      );
      expect(xpath.parse('0.525 * 1000000 * 1000000 * 1000000 * 1000000').evaluateString()).to.equal(
        '525000000000000000000000'
      );
    });

    it('local-name() and name() of processing instruction', () => {
      const xml = '<?book-record added="2015-01-16" author="J.K. Rowling" ?><book>Harry Potter</book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const expectedName = 'book-record';
      const localName = xpath.select('local-name(/processing-instruction())', doc);
      const name = xpath.select('name(/processing-instruction())', doc);

      expect(localName).to.equal(expectedName);
      expect(name).to.equal(expectedName);
    });

    it('evaluate substring-after', () => {
      const xml = '<classmate>Hermione</classmate>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const part = xpath.select('substring-after(/classmate, "Her")', doc);
      expect(part).to.equal('mione');
    });

    it('parsed expression with no options', () => {
      const parsed = xpath.parse('5 + 7');

      expect(typeof parsed).to.equal('object');
      expect(typeof parsed.evaluate).to.equal('function');
      expect(typeof parsed.evaluateNumber).to.equal('function');

      expect(parsed.evaluateNumber()).to.equal(12);

      // evaluating twice should yield the same result
      expect(parsed.evaluateNumber()).to.equal(12);
    });

    it('select1() on parsed expression', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const parsed = xpath.parse('/*/title');

      expect(typeof parsed).to.equal('object');

      expect(typeof parsed.select1).to.equal('function');

      const single = parsed.select1({ node: doc });

      expect((single as Element).localName).to.equal('title');
      expect((single.firstChild as Text).data).to.equal('Harry Potter');
      expect(toString(single)).to.equal('<title>Harry Potter</title>');
    });

    it('select() on parsed expression', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const parsed = xpath.parse('/*/title');

      expect(typeof parsed).to.equal('object');

      expect(typeof parsed.select).to.equal('function');

      const nodes = parsed.select({ node: doc });

      expect(nodes).to.exist;
      expect(nodes).to.have.length(1);
      expect((nodes[0] as Element).localName).to.equal('title');
      expect((nodes[0].firstChild as Text).data).to.equal('Harry Potter');
      expect(toString(nodes[0])).to.equal('<title>Harry Potter</title>');
    });

    it('evaluateString(), and evaluateNumber() on parsed expression with node', () => {
      const xml = '<book><title>Harry Potter</title><numVolumes>7</numVolumes></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const parsed = xpath.parse('/*/numVolumes');

      expect(typeof parsed).to.equal('object');

      expect(typeof parsed.evaluateString).to.equal('function');
      expect(parsed.evaluateString({ node: doc })).to.equal('7');

      expect(typeof parsed.evaluateBoolean).to.equal('function');
      expect(parsed.evaluateBoolean({ node: doc })).to.equal(true);

      expect(typeof parsed.evaluateNumber).to.equal('function');
      expect(parsed.evaluateNumber({ node: doc })).to.equal(7);
    });

    it('evaluateBoolean() on parsed empty node set and boolean expressions', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      function evaluate(path: string) {
        return xpath.parse(path).evaluateBoolean({ node: doc });
      }

      expect(evaluate('/*/myrtle')).to.equal(false);

      expect(evaluate('not(/*/myrtle)')).to.equal(true);

      expect(evaluate('/*/title')).to.equal(true);

      expect(evaluate('/*/title = "Harry Potter"')).to.equal(true);

      expect(evaluate('/*/title != "Harry Potter"')).to.equal(false);

      expect(evaluate('/*/title = "Percy Jackson"')).to.equal(false);
    });

    it('namespaces with parsed expression', () => {
      const xml =
        '<characters xmlns:ps="http://philosophers-stone.com" xmlns:cs="http://chamber-secrets.com">' +
        '<ps:character>Quirrell</ps:character><ps:character>Fluffy</ps:character>' +
        '<cs:character>Myrtle</cs:character><cs:character>Tom Riddle</cs:character>' +
        '</characters>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const expr = xpath.parse('/characters/c:character');
      const countExpr = xpath.parse('count(/characters/c:character)');
      const csns = 'http://chamber-secrets.com';

      function resolve(prefix: string) {
        if (prefix === 'c') {
          return csns;
        }
      }

      function testContext(context: xpath.EvalOptions, description: string) {
        try {
          const value = expr.evaluateString(context);
          const count = countExpr.evaluateNumber(context);

          expect(value).to.equal('Myrtle');
          expect(count).to.equal(2);
        } catch (e) {
          e.message = description + ': ' + (e.message || '');
          throw e;
        }
      }

      testContext(
        {
          node: doc,
          namespaces: {
            c: csns
          }
        },
        'Namespace map'
      );

      testContext(
        {
          node: doc,
          namespaces: resolve
        },
        'Namespace function'
      );

      testContext(
        {
          node: doc,
          namespaces: {
            getNamespace: resolve
          }
        },
        'Namespace object'
      );
    });

    it('custom functions', () => {
      const xml = '<book><title>Harry Potter</title></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const parsed = xpath.parse('concat(double(/*/title), " is cool")');

      function doubleString(_context: xpath.EvalOptions, ...args: xpath.Expression[]) {
        expect(args).to.have.length(1);
        const value = args[0];

        const str = value.stringValue;
        return str + str;
      }

      function functions(name: string, _namespace: string) {
        if (name === 'double') {
          return doubleString;
        }
        return null;
      }

      function testContext(context: xpath.EvalOptions, description: string) {
        try {
          const actual = parsed.evaluateString(context);
          const expected = 'Harry PotterHarry Potter is cool';
          expect(actual).to.equal(expected);
        } catch (e) {
          e.message = description + ': ' + (e.message || '');
          throw e;
        }
      }

      testContext(
        {
          node: doc,
          functions
        },
        'Functions function'
      );

      testContext(
        {
          node: doc,
          functions: {
            getFunction: functions
          }
        },
        'Functions object'
      );

      testContext(
        {
          node: doc,
          functions: {
            double: doubleString
          }
        },
        'Functions map'
      );
    });

    it('custom function namespaces', () => {
      const xml =
        '<book><title>Harry Potter</title><friend>Ron</friend><friend>Hermione</friend><friend>Neville</friend></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const parsed = xpath.parse('concat(hp:double(/*/title), " is 2 cool ", hp:square(2), " school")');
      const hpns = 'http://harry-potter.com';

      const context = {
        node: doc,
        namespaces: {
          hp: hpns
        },
        functions(name: string, namespace: string) {
          if (namespace === hpns) {
            switch (name) {
              case 'double':
                return (_context: xpath.XPathContext, ...args: xpath.Expression[]) => {
                  expect(args).to.have.length(1);
                  const value = args[0];

                  const str = value.stringValue;
                  return str + str;
                };
              case 'square':
                return (_context: xpath.XPathContext, value: xpath.Expression) => {
                  const num = value.numberValue;
                  return num * num;
                };

              case 'xor':
                return (_context: xpath.XPathContext, ...args: xpath.Expression[]) => {
                  expect(args).to.have.length(2);
                  const l = args[0];
                  const r = args[1];

                  const lbool = l.booleanValue;
                  const rbool = r.booleanValue;
                  return (lbool || rbool) && !(lbool && rbool);
                };

              case 'second':
                return (_context: xpath.XPathContext, nodes: xpath.XNodeSet) => {
                  const nodesArr = nodes.toArray();
                  const second = nodesArr[1];
                  return second ? [second] : [];
                };
            }
          }
          return null;
        }
      };

      expect(parsed.evaluateString(context)).to.equal('Harry PotterHarry Potter is 2 cool 4 school');

      expect(xpath.parse('hp:xor(false(), false())').evaluateBoolean(context)).to.equal(false);
      expect(xpath.parse('hp:xor(false(), true())').evaluateBoolean(context)).to.equal(true);
      expect(xpath.parse('hp:xor(true(), false())').evaluateBoolean(context)).to.equal(true);
      expect(xpath.parse('hp:xor(true(), true())').evaluateBoolean(context)).to.equal(false);

      expect(xpath.parse('hp:second(/*/friend)').evaluateString(context)).to.equal('Hermione');
      expect(xpath.parse('count(hp:second(/*/friend))').evaluateNumber(context)).to.equal(1);
      expect(xpath.parse('count(hp:second(/*/friendz))').evaluateNumber(context)).to.equal(0);
    });

    it('xpath variables', () => {
      const xml = '<book><title>Harry Potter</title><volumes>7</volumes></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');

      const variables: { [key: string]: any } = {
        title: 'Harry Potter',
        notTitle: 'Percy Jackson',
        houses: 4
      };

      function variableFunction(name: string) {
        return variables[name];
      }

      function testContext(context: xpath.EvalOptions, description: string) {
        try {
          expect(xpath.parse('$title = /*/title').evaluateBoolean(context)).to.equal(true);
          expect(xpath.parse('$notTitle = /*/title').evaluateBoolean(context)).to.equal(false);
          expect(xpath.parse('$houses + /*/volumes').evaluateNumber(context)).to.equal(11);
        } catch (e) {
          e.message = description + ': ' + (e.message || '');
          throw e;
        }
      }

      testContext(
        {
          node: doc,
          variables: variableFunction
        },
        'Variables function'
      );

      testContext(
        {
          node: doc,
          variables: {
            getVariable: variableFunction
          }
        },
        'Variables object'
      );

      testContext(
        {
          node: doc,
          variables
        },
        'Variables map'
      );
    });

    it('xpath variable namespaces', () => {
      const xml = '<book><title>Harry Potter</title><volumes>7</volumes></book>';
      const doc = new dom().parseFromString(xml, 'text/xml');
      const hpns = 'http://harry-potter.com';

      const context = {
        node: doc,
        namespaces: {
          hp: hpns
        },
        variables(name: string, namespace: string) {
          if (namespace === hpns) {
            switch (name) {
              case 'title':
                return 'Harry Potter';
              case 'houses':
                return 4;
              case 'false':
                return false;
              case 'falseStr':
                return 'false';
            }
          } else if (namespace === '') {
            switch (name) {
              case 'title':
                return 'World';
            }
          }

          return null;
        }
      };

      expect(xpath.parse('$hp:title = /*/title').evaluateBoolean(context)).to.equal(true);
      expect(xpath.parse('$title = /*/title').evaluateBoolean(context)).to.equal(false);
      expect(xpath.parse('$title').evaluateString(context)).to.equal('World');
      expect(xpath.parse('$hp:false').evaluateBoolean(context)).to.equal(false);
      expect(xpath.parse('$hp:falseStr').evaluateBoolean(context)).not.to.equal(false);
      expect(() => {
        xpath.parse('$hp:hello').evaluateString(context);
      }).to.throw(XPathException);
    });

    it('detect unterminated string literals', () => {
      function testUnterminated(path: string) {
        expect(() => {
          xpath.evaluate(path);
        }).to.throw(XPathException);
      }

      testUnterminated('"Hello');
      testUnterminated("'Hello");
      testUnterminated('self::text() = """');
      testUnterminated('"""');
    });

    if (!useDom4) {
      it('string value for CDATA sections', () => {
        const xml =
          '<people><person><![CDATA[Harry Potter]]></person><person>Ron <![CDATA[Weasley]]></person></people>';
        const doc = new dom().parseFromString(xml, 'text/xml');
        const person1 = xpath.parse('/people/person').evaluateString({ node: doc });
        const person2 = xpath.parse('/people/person/text()').evaluateString({ node: doc });
        const person3 = xpath.select('string(/people/person/text())', doc);
        const person4 = xpath.parse('/people/person[2]').evaluateString({ node: doc });

        expect(person1).to.equal('Harry Potter');
        expect(person2).to.equal('Harry Potter');
        expect(person3).to.equal('Harry Potter');
        expect(person4).to.equal('Ron Weasley');
      });
    }

    it('string value of various node types', () => {
      const xml =
        "<book xmlns:hp='http://harry'><!-- This describes the Harry Potter Book --><?author name='J.K. Rowling' ?><title lang='en'><![CDATA[Harry Potter & the Philosopher's Stone]]></title><character>Harry Potter</character></book>";
      const doc = new dom().parseFromString(xml, 'text/xml');
      const allText = xpath.parse('.').evaluateString({ node: doc });
      const ns = xpath.parse('*/namespace::*[name() = "hp"]').evaluateString({ node: doc });
      const title = xpath.parse('*/title').evaluateString({ node: doc });
      const child = xpath.parse('*/*').evaluateString({ node: doc });
      const titleLang = xpath.parse('*/*/@lang').evaluateString({ node: doc });
      const pi = xpath.parse('*/processing-instruction()').evaluateString({ node: doc });
      const comment = xpath.parse('*/comment()').evaluateString({ node: doc });

      expect(allText).to.equal("Harry Potter & the Philosopher's StoneHarry Potter");
      expect(ns).to.equal('http://harry');
      expect(title).to.equal("Harry Potter & the Philosopher's Stone");
      expect(child).to.equal("Harry Potter & the Philosopher's Stone");
      expect(titleLang).to.equal('en');
      expect(pi.trim()).to.equal("name='J.K. Rowling'");
      expect(comment).to.equal(' This describes the Harry Potter Book ');
    });

    it('exposes custom types', () => {
      expect(xpath.XPath).to.exist;
      expect(xpath.XPathParser).to.exist;
      expect(xpath.XPathResult).to.exist;

      expect(xpath.Step).to.exist;
      expect(xpath.NodeTest).to.exist;
      expect(xpath.BarOperation).to.exist;

      expect(xpath.NamespaceResolver).to.exist;
      expect(xpath.FunctionResolver).to.exist;
      expect(xpath.VariableResolver).to.exist;

      expect(xpath.XPathContext).to.exist;
      expect(xpath.XNodeSet).to.exist;
      expect(xpath.XBoolean).to.exist;
      expect(xpath.XString).to.exist;
      expect(xpath.XNumber).to.exist;
    });

    it('work with nodes created using DOM1 createElement()', () => {
      const doc = new dom().parseFromString('<book />', 'text/xml');

      doc.documentElement.appendChild(doc.createElement('characters'));

      expect(xpath.select1('/book/characters', doc)).to.be.ok;

      expect(xpath.select1('local-name(/book/characters)', doc)).to.equal('characters');
    });

    it('preceding:: axis works on document fragments', () => {
      const doc = new dom().parseFromString('<n />', 'text/xml');
      const df = doc.createDocumentFragment();
      const root = doc.createElement('book');

      df.appendChild(root);

      for (let i = 0; i < 10; i += 1) {
        root.appendChild(doc.createElement('chapter'));
      }

      const chapter = xpath.select1('book/chapter[5]', df) as Element;

      expect(chapter).to.be.ok;

      expect(xpath.select('count(preceding::chapter)', chapter)).to.equal(4);
    });

    it('node set sorted and unsorted arrays', () => {
      const doc = new dom().parseFromString(
        '<book><character>Harry</character><character>Ron</character><character>Hermione</character></book>',
        'text/xml'
      );
      const path = xpath.parse('/*/*[3] | /*/*[2] | /*/*[1]');

      const nset = path.evaluateNodeSet({ node: doc });
      const sorted = nset.toArray();
      const unsorted = nset.toUnsortedArray();

      expect(sorted).to.have.length(3);
      expect(unsorted).to.have.length(3);

      expect(sorted[0].textContent).to.equal('Harry');
      expect(sorted[1].textContent).to.equal('Ron');
      expect(sorted[2].textContent).to.equal('Hermione');

      expect(sorted[0]).not.to.equal(unsorted[0]);
    });

    it('meaningful error for invalid function', () => {
      const path = xpath.parse('invalidFunc()');

      expect(() => {
        path.evaluateString();
      }).to.throw(Error);

      const path2 = xpath.parse('funcs:invalidFunc()');

      expect(() => {
        path2.evaluateString({
          namespaces: {
            funcs: 'myfunctions'
          }
        });
      }).to.throw(Error);
    });

    // https://github.com/goto100/xpath/issues/32
    it('supports contains() function on attributes', () => {
      const doc = new dom().parseFromString(
        "<books><book title='Harry Potter and the Philosopher\"s Stone' /><book title='Harry Potter and the Chamber of Secrets' /></books>",
        'text/xml'
      );
      const andTheBooks = xpath.select("/books/book[contains(@title, ' ')]", doc);
      const secretBooks = xpath.select("/books/book[contains(@title, 'Secrets')]", doc);

      expect(andTheBooks).to.have.length(2);
      expect(secretBooks).to.have.length(1);
    });

    it('compare multiple nodes to multiple nodes (equals)', () => {
      const xml =
        '<school><houses>' +
        '<house name="Gryffindor"><student>Harry</student><student>Hermione</student></house>' +
        '<house name="Slytherin"><student>Draco</student><student>Crabbe</student></house>' +
        '<house name="Ravenclaw"><student>Luna</student><student>Cho</student></house>' +
        '</houses>' +
        '<honorStudents><student>Hermione</student><student>Luna</student></honorStudents></school>';

      const doc = new dom().parseFromString(xml, 'text/xml');
      const houses = xpath.parse('/school/houses/house[student = /school/honorStudents/student]').select({ node: doc });

      expect(houses).to.have.length(2);

      const houseNames = houses
        .map((node) => {
          return (node as Element).getAttribute('name');
        })
        .sort();

      expect(houseNames[0]).to.equal('Gryffindor');
      expect(houseNames[1]).to.equal('Ravenclaw');
    });

    it('compare multiple nodes to multiple nodes (gte)', () => {
      const xml =
        '<school><houses>' +
        '<house name="Gryffindor"><student level="5">Harry</student><student level="9">Hermione</student></house>' +
        '<house name="Slytherin"><student level="1">Goyle</student><student level="1">Crabbe</student></house>' +
        '<house name="Ravenclaw"><student level="4">Luna</student><student level="3">Cho</student></house>' +
        '</houses>' +
        '<courses><course minLevel="9">DADA</course><course minLevel="4">Charms</course></courses>' +
        '</school>';

      const doc = new dom().parseFromString(xml, 'text/xml');
      const houses = xpath
        .parse('/school/houses/house[student/@level >= /school/courses/course/@minLevel]')
        .select({ node: doc });

      expect(houses).to.have.length(2);

      const houseNames = houses
        .map((node) => {
          return (node as Element).getAttribute('name');
        })
        .sort();

      expect(houseNames[0]).to.equal('Gryffindor');
      expect(houseNames[1]).to.equal('Ravenclaw');
    });

    it('inequality comparisons with nodesets', () => {
      const xml =
        "<books><book num='1' title='PS' /><book num='2' title='CoS' /><book num='3' title='PoA' /><book num='4' title='GoF' /><book num='5' title='OotP' /><book num='6' title='HBP' /><book num='7' title='DH' /></books>";
      const doc = new dom().parseFromString(xml, 'text/xml');

      const options = { node: doc, variables: { theNumber: 3, theString: '3', theBoolean: true } };

      const numberPaths = [
        '/books/book[$theNumber <= @num]',
        '/books/book[$theNumber < @num]',
        '/books/book[$theNumber >= @num]',
        '/books/book[$theNumber > @num]'
      ];

      const stringPaths = [
        '/books/book[$theString <= @num]',
        '/books/book[$theString < @num]',
        '/books/book[$theString >= @num]',
        '/books/book[$theString > @num]'
      ];

      const booleanPaths = [
        '/books/book[$theBoolean <= @num]',
        '/books/book[$theBoolean < @num]',
        '/books/book[$theBoolean >= @num]',
        '/books/book[$theBoolean > @num]'
      ];

      const lhsPaths = ['/books/book[@num <= $theNumber]', '/books/book[@num < $theNumber]'];

      function countNodes(paths: string[]) {
        return paths
          .map(xpath.parse)
          .map((path) => {
            return path.select(options);
          })
          .map((arr) => {
            return arr.length;
          });
      }

      expect(countNodes(numberPaths)).to.deep.equal([5, 4, 3, 2]);
      expect(countNodes(stringPaths)).to.deep.equal([5, 4, 3, 2]);
      expect(countNodes(booleanPaths)).to.deep.equal([7, 6, 1, 0]);
      expect(countNodes(lhsPaths)).to.deep.equal([3, 2]);
    });

    it('error when evaluating boolean as number', () => {
      const num = xpath.parse('"a" = "b"').evaluateNumber();

      expect(num).to.equal(0);

      const str = xpath.select('substring("expelliarmus", 1, "a" = "a")');

      expect(str).to.equal('e');
    });

    it('string values of parsed expressions', () => {
      const parser = new xpath.XPathParser();

      const simpleStep = parser.parse('my:book');

      expect(simpleStep.toString()).to.equal('child::my:book');

      const precedingSib = parser.parse('preceding-sibling::my:chapter');

      expect(precedingSib.toString()).to.equal('preceding-sibling::my:chapter');

      const withPredicates = parser.parse('book[number > 3][contains(title, "and the")]');

      expect(withPredicates.toString()).to.equal("child::book[(child::number > 3)][contains(child::title, 'and the')]");

      const parenthesisWithPredicate = parser.parse('(/books/book/chapter)[7]');

      expect(parenthesisWithPredicate.toString()).to.equal('(/child::books/child::book/child::chapter)[7]');

      const charactersOver20 = parser.parse('heroes[age > 20] | villains[age > 20]');

      expect(charactersOver20.toString()).to.equal(
        'child::heroes[(child::age > 20)] | child::villains[(child::age > 20)]'
      );
    });

    it('context position should work correctly', () => {
      const doc = new dom().parseFromString(
        "<books><book><chapter>The boy who lived</chapter><chapter>The vanishing glass</chapter></book><book><chapter>The worst birthday</chapter><chapter>Dobby's warning</chapter><chapter>The burrow</chapter></book></books>",
        'text/xml'
      );

      const chapters = xpath.parse('/books/book/chapter[2]').select({ node: doc });

      expect(chapters).to.have.length(2);
      expect(chapters[0].textContent).to.equal('The vanishing glass');
      expect(chapters[1].textContent).to.equal("Dobby's warning");

      const lastChapters = xpath.parse('/books/book/chapter[last()]').select({ node: doc });

      expect(lastChapters).to.have.length(2);
      expect(lastChapters[0].textContent).to.equal('The vanishing glass');
      expect(lastChapters[1].textContent).to.equal('The burrow');

      const secondChapter = xpath.parse('(/books/book/chapter)[2]').select({ node: doc });

      expect(secondChapter).to.have.length(1);
      expect(chapters[0].textContent).to.equal('The vanishing glass');

      const lastChapter = xpath.parse('(/books/book/chapter)[last()]').select({ node: doc });

      expect(lastChapter).to.have.length(1);
      expect(lastChapter[0].textContent).to.equal('The burrow');
    });

    it('should allow null namespaces for null prefixes', () => {
      const markup =
        '<html><head></head><body><p>Hi Ron!</p><my:p xmlns:my="http://www.example.com/my">Hi Draco!</my:p><p>Hi Hermione!</p></body></html>';
      const docHtml = new dom().parseFromString(markup, 'text/html');

      const noPrefixPath = xpath.parse('/html/body/p[2]');

      const greetings1 = noPrefixPath.select({ node: docHtml, allowAnyNamespaceForNoPrefix: false });

      expect(greetings1).to.have.length(0);

      const allowAnyNamespaceOptions = { node: docHtml, allowAnyNamespaceForNoPrefix: true };

      // if allowAnyNamespaceForNoPrefix specified, allow using prefix-less node tests to match nodes with no prefix
      const greetings2 = noPrefixPath.select(allowAnyNamespaceOptions);

      expect(greetings2).to.have.length(1);
      expect(greetings2[0].textContent).to.equal('Hi Hermione!');

      const allGreetings = xpath.parse('/html/body/p').select(allowAnyNamespaceOptions);

      expect(allGreetings).to.have.length(2);

      const nsm = { html: xhtmlNs, other: 'http://www.example.com/other' };

      const prefixPath = xpath.parse('/html:html/body/html:p');
      const optionsWithNamespaces = { node: docHtml, allowAnyNamespaceForNoPrefix: true, namespaces: nsm };

      // if the path uses prefixes, they have to match
      const greetings3 = prefixPath.select(optionsWithNamespaces);

      expect(greetings3).to.have.length(2);

      const badPrefixPath = xpath.parse('/html:html/other:body/html:p');

      const greetings4 = badPrefixPath.select(optionsWithNamespaces);
      expect(greetings4).to.have.length(0);
    });

    it('support isHtml option', () => {
      const markup =
        '<html><head></head><body><p>Hi Ron!</p><my:p xmlns:my="http://www.example.com/my">Hi Draco!</my:p><p>Hi Hermione!</p></body></html>';
      const docHtml = new dom().parseFromString(markup, 'text/html');

      const ns = { h: xhtmlNs };

      // allow matching on unprefixed nodes
      const greetings1 = xpath.parse('/html/body/p').select({ node: docHtml, isHtml: true });

      expect(greetings1).to.have.length(2);

      // allow case insensitive match
      const greetings2 = xpath.parse('/h:html/h:bOdY/h:p').select({ node: docHtml, namespaces: ns, isHtml: true });

      expect(greetings2).to.have.length(2);

      // non-html mode: allow select if case and namespaces match
      const greetings3 = xpath.parse('/h:html/h:body/h:p').select({ node: docHtml, namespaces: ns });

      expect(greetings3).to.have.length(2);

      // non-html mode: require namespaces
      const greetings4 = xpath.parse('/html/body/p').select({ node: docHtml, namespaces: ns });

      expect(greetings4).to.have.length(0);

      // non-html mode: require case to match
      const greetings5 = xpath.parse('/h:html/h:bOdY/h:p').select({ node: docHtml, namespaces: ns });

      expect(greetings5).to.have.length(0);
    });

    it('builtin functions', () => {
      const translated = xpath.parse('translate("hello", "lhho", "yHb")').evaluateString();

      expect(translated).to.equal('Heyy');

      const characters = new dom().parseFromString(
        '<characters><character>Harry</character><character>Ron</character><character>Hermione</character></characters>',
        'text/xml'
      );

      const firstTwo = xpath.parse('/characters/character[position() <= 2]').select({ node: characters });

      expect(firstTwo).to.have.length(2);
      expect(firstTwo[0].textContent).to.equal('Harry');
      expect(firstTwo[1].textContent).to.equal('Ron');

      const last = xpath.parse('/characters/character[last()]').select({ node: characters });

      expect(last).to.have.length(1);
      expect(last[0].textContent).to.equal('Hermione');
    });

    it('id string function', () => {
      const xmlString =
        '<body>' +
        '<div id="test1" />' +
        '<div id="testid">test1</div>' +
        '<a id="jshref" href="javascript:doFoo(\'a\', \'b\')">' +
        '   javascript href with spaces' +
        ' </a>' +
        ' <span id="u1" class="u" />' +
        ' <span id="u2" class="u" />' +
        ' <span id="u3" class="u" />' +
        ' <span style="visibility: visible">do not squint!</span>' +
        '</body>';

      const ex = "count(id('testid'))";
      const xml = new dom().parseFromString(xmlString, 'text/xml');

      const result = xpath.evaluate(ex, xml);

      expect(result.numberValue).to.equal(1);
    });

    it('id node-set function', () => {
      const xmlString =
        '<body>' +
        '<div id="test1" />' +
        '<div id="testid">test1</div>' +
        '<a id="jshref" href="javascript:doFoo(\'a\', \'b\')">' +
        '   javascript href with spaces' +
        ' </a>' +
        ' <span id="u1" class="u" />' +
        ' <span id="u2" class="u" />' +
        ' <span id="u3" class="u" />' +
        ' <span style="visibility: visible">do not squint!</span>' +
        '</body>';

      const ex = "count(id(//*[@id='testid']))";
      const xml = new dom().parseFromString(xmlString, 'text/xml');

      const result = xpath.evaluate(ex, xml);

      expect(result.numberValue).to.equal(1);
    });

    describe('Axis tests', () => {
      const xmlString = [
        '<page>',
        ' <p></p>',
        ' <list id="parent">',
        '  <item></item>',
        '  <item id="self"><d><d></d></d></item>',
        '  <item></item>',
        '  <item></item>',
        '  <item></item>',
        ' </list>',
        ' <f></f>',
        '</page>'
      ].join('');
      const xml = new dom().parseFromString(xmlString, 'text/xml');

      it('following', () => {
        const ex = "count(//*[@id='self']/following::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(4);
      });

      it('following sibling', () => {
        const ex = "count(//*[@id='self']/following-sibling::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(3);
      });

      it('following sibling 2', () => {
        const ex = "count(//*[@id='self']/@*/following-sibling::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(0);
      });

      it('proceeding', () => {
        const ex = "count(//*[@id='self']/preceding::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(2);
      });

      it('proceeding sibling', () => {
        const ex = "count(//*[@id='self']/preceding-sibling::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(1);
      });

      it('proceeding sibling 2', () => {
        const ex = "count(//*[@id='self']/@*/preceding-sibling::*)";

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(0);
      });

      it('parent', () => {
        const ex = "//*[@id='self']/parent::*/@id";

        const result = xpath.evaluate(ex, xml);
        expect(result.stringValue).to.equal('parent');
      });

      it('parent2', () => {
        const ex = 'count(/parent::*)';

        const result = xpath.evaluate(ex, xml);
        expect(result.numberValue).to.equal(0);
      });

      it('self', () => {
        const ex = "//*[@id='self']/self::*/@id";

        const result = xpath.evaluate(ex, xml);
        expect(result.stringValue).to.equal('self');
      });
    });
  });
}

function asNodes(result: any) {
  return result as Node[];
}

function toString(node: string | number | boolean | Node | Node[]): string {
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  } else if (Array.isArray(node)) {
    return node.map((n) => toString(n)).join(',');
  } else if (isElement(node)) {
    return node.outerHTML !== undefined ? node.outerHTML : node.toString();
  } else if (isAttribute(node)) {
    return node.value;
  } else if (isText(node)) {
    return node.nodeValue!;
  } else {
    return '';
  }
}
