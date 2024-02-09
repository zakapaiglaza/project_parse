Revision 23: May 24, 2019
Switched to XMLDOM-TS as test implementation

Revision 22: December 17, 2018
Change default namespace handling for Xpath evaluator

Revision 21: December 10, 2018
Completely rewritten to TypeScript
One monolith file divided into classes
Test rewritten to Mocha + Chai
Changed XPathResult.stringValue and other similar methods to getters for comformance with https://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult
Add preliminary DOM4 support (JSdom implementation)

Revision 20: April 26, 2011
Fixed a typo resulting in FIRST_ORDERED_NODE_TYPE results being wrong,
thanks to <shi_a009 (at) hotmail.com>.

Revision 19: November 29, 2005
Nodesets now store their nodes in a height balanced tree, increasing
performance for the common case of selecting nodes in document order,
thanks to S 閎 astien Cramatte <contact (at) zeninteractif.com>.
AVL tree code adapted from Raimund Neumann <rnova (at) gmx.net>.

Revision 18: October 27, 2005
DOM 3 XPath support. Caveats: - namespace prefixes aren't resolved in XPathEvaluator.createExpression,
but in XPathExpression.evaluate. - XPathResult.invalidIteratorState is not implemented.

Revision 17: October 25, 2005
Some core XPath function fixes and a patch to avoid crashing certain
versions of MSXML in PathExpr.prototype.getOwnerElement, thanks to
S 閎 astien Cramatte <contact (at) zeninteractif.com>.

Revision 16: September 22, 2005
Workarounds for some IE 5.5 deficiencies.
Fixed problem with prefix node tests on attribute nodes.

Revision 15: May 21, 2005
Fixed problem with QName node tests on elements with an xmlns="...".

Revision 14: May 19, 2005
Fixed QName node tests on attribute node regression.

Revision 13: May 3, 2005
Node tests are case insensitive now if working in an HTML DOM.

Revision 12: April 26, 2005
Updated licence. Slight code changes to enable use of Dean
Edwards' script compression, http://dean.edwards.name/packer/ .

Revision 11: April 23, 2005
Fixed bug with 'and' and 'or' operators, fix thanks to
Sandy McArthur <sandy (at) mcarthur.org>.

Revision 10: April 15, 2005
Added support for a virtual root node, supposedly helpful for
implementing XForms. Fixed problem with QName node tests and
the parent axis.

Revision 9: March 17, 2005
Namespace resolver tweaked so using the document node as the context
for namespace lookups is equivalent to using the document element.

Revision 8: February 13, 2005
Handle implicit declaration of 'xmlns' namespace prefix.
Fixed bug when comparing nodesets.
Instance data can now be associated with a FunctionResolver, and
workaround for MSXML not supporting 'localName' and 'getElementById',
thanks to Grant Gongaware.
Fix a few problems when the context node is the root node.

Revision 7: February 11, 2005
Default namespace resolver fix from Grant Gongaware
<grant (at) gongaware.com>.

Revision 6: February 10, 2005
Fixed bug in 'number' function.

Revision 5: February 9, 2005
Fixed bug where text nodes not getting converted to string values.

Revision 4: January 21, 2005
Bug in 'name' function, fix thanks to Bill Edney.
Fixed incorrect processing of namespace nodes.
Fixed NamespaceResolver to resolve 'xml' namespace.
Implemented union '|' operator.

Revision 3: January 14, 2005
Fixed bug with nodeset comparisons, bug lexing < and >.

Revision 2: October 26, 2004
QName node test namespace handling fixed. Few other bug fixes.

Revision 1: August 13, 2004
Bug fixes from William J. Edney <bedney (at) technicalpursuit.com>.
Added minimal licence.

Initial version: June 14, 2004
