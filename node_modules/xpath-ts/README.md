# XPath library

DOM 3 and 4 XPath 1.0 implemention for browser and Node.js environment with support for custom **Function**, **Variable** and **Namespace** mapping.

## Requirements

- [Node v11.x or greater](https://nodejs.org/en/download/)

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## Usage

Install with [npm](http://github.com/isaacs/npm):

```
npm install xpath-ts
```

This library is xml engine agnostic but I recommend to use [xmldom-ts](https://github.com/backslash47/xmldom), [xmldom](https://github.com/jindw/xmldom) or [jsdom](https://github.com/jsdom/jsdom)

```
npm install xmldom-ts
```
or 

```
npm install xmldom
```


or

```
npm install jsdom
```

## API Documentation

Can be found [here](https://github.com/backslash47/backslash47/blob/master/docs/xpath%20methods.md). See below for example usage.

## Your first xpath:

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = '<book><title>Harry Potter</title></book>';
const doc = new dom().parseFromString(xml);
const nodes = xpath.select('//title', doc);

console.log(nodes[0].localName + ': ' + nodes[0].firstChild.data);
console.log('Node: ' + nodes[0].toString());
```

➡

```
title: Harry Potter
Node: <title>Harry Potter</title>
```

### Alternatively

Using the same interface you have on modern browsers ([MDN])

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = "<book author='J. K. Rowling'><title>Harry Potter</title></book>";
const doc = new dom().parseFromString(xml);

xpath.installDOM3XPathSupport(doc);

const result = doc.evaluate(
  '/book/title', // xpathExpression
  doc, // contextNode
  null, // namespaceResolver
  xpath.XPathResult.ANY_TYPE, // resultType
  null // result
);

let node = result.iterateNext();
while (node) {
  console.log(node.localName + ': ' + node.firstChild.data);
  console.log('Node: ' + node.toString());

  node = result.iterateNext();
}
```

➡

```
title: Harry Potter
Node: <title>Harry Potter</title>
```

## Evaluate string values directly:

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = '<book><title>Harry Potter</title></book>';
const doc = new dom().parseFromString(xml);
const title = xpath.select('string(//title)', doc);

console.log(title);
```

➡

```
Harry Potter
```

## Namespaces

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = "<book><title xmlns='myns'>Harry Potter</title></book>";
const doc = new dom().parseFromString(xml);
const node = xpath.select("//*[local-name(.)='title' and namespace-uri(.)='myns']", doc)[0];

console.log(node.namespaceURI);
```

➡

```
myns
```

## Namespaces with easy mappings

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = "<book xmlns:bookml='http://example.com/book'><bookml:title>Harry Potter</bookml:title></book>";
const select = xpath.useNamespaces({ bookml: 'http://example.com/book' });

console.log(select('//bookml:title/text()', doc)[0].nodeValue);
```

➡

```
Harry Potter
```

## Default namespace with mapping

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = "<book xmlns='http://example.com/book'><title>Harry Potter</title></book>";
const select = xpath.useNamespaces({ bookml: 'http://example.com/book' });

console.log(select('//bookml:title/text()', doc)[0].nodeValue);
```

➡

```
Harry Potter
```

## Attributes

```typescript
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';

const xml = "<book author='J. K. Rowling'><title>Harry Potter</title></book>";
const doc = new dom().parseFromString(xml);
const author = xpath.select1('/book/@author', doc).value;

console.log(author);
```

➡

```
J. K. Rowling
```

[mdn]: https://developer.mozilla.org/en/docs/Web/API/Document/evaluate

## Developing and Testing

#### Download

```
git clone 'https://github.com/backslash47/xpath-ts'
cd xpath-ts
```

#### Install

```
npm install
```

#### Build

```
npm run build
```

You will get the transpiled code under '/dist/lib' and typings under '/dist/types'.

#### Test

Run standard tests with Mocha + Chai testing framework

```
npm test
```

## Authors

- **Cameron McCormack** - _Initial work_ - [blog](http://mcc.id.au/xpathjs)
- **Yaron Naveh** - [blog](http://webservices20.blogspot.com/)
- **goto100**
- **Jimmy Rishe**
- **Thomas Weinert**
- **Matus Zamborsky** - _TypeScript rewrite_ - [Backslash47](https://github.com/backslash47)
- **Others** - [others](https://github.com/goto100/xpath/graphs/contributors)

## Licence

This project is licensed under the MIT License - see the [LICENCE.md](LICENCE.md) file for details.
