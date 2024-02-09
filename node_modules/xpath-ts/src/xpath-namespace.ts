// tslint:disable:member-ordering

export class XPathNamespace implements Node {
  static XPATH_NAMESPACE_NODE = 13;

  isXPathNamespace = true;
  ownerDocument: Document | null;
  nodeName = '#namespace';
  prefix: string;
  localName: string;
  namespaceURI: string;
  nodeValue: string;
  ownerElement: Element;
  nodeType: number;

  constructor(pre: string, ns: string, p: Element) {
    this.isXPathNamespace = true;
    this.ownerDocument = p.ownerDocument;
    this.nodeName = '#namespace';
    this.prefix = pre;
    this.localName = pre;
    this.namespaceURI = ns;
    this.nodeValue = ns;
    this.ownerElement = p;
    this.nodeType = XPathNamespace.XPATH_NAMESPACE_NODE;
  }

  toString() {
    return '{ "' + this.prefix + '", "' + this.namespaceURI + '" }';
  }

  /**
   * Unused and unsupported properties
   */
  readonly baseURI: string;
  readonly childNodes: NodeListOf<ChildNode>;
  readonly firstChild: ChildNode | null;
  readonly isConnected: boolean;
  readonly lastChild: ChildNode | null;
  readonly nextSibling: ChildNode | null;
  readonly parentElement: HTMLElement | null;
  readonly parentNode: Node & ParentNode | null;
  readonly previousSibling: Node | null;
  textContent: string | null;
  appendChild = unsupported;
  cloneNode = unsupported;
  compareDocumentPosition = unsupported;
  contains = unsupported;
  getRootNode = unsupported;
  hasChildNodes = unsupported;
  insertBefore = unsupported;
  isDefaultNamespace = unsupported;
  isEqualNode = unsupported;
  isSameNode = unsupported;
  lookupNamespaceURI = unsupported;
  lookupPrefix = unsupported;
  normalize = unsupported;
  removeChild = unsupported;
  replaceChild = unsupported;
  readonly ATTRIBUTE_NODE: number;
  readonly CDATA_SECTION_NODE: number;
  readonly COMMENT_NODE: number;
  readonly DOCUMENT_FRAGMENT_NODE: number;
  readonly DOCUMENT_NODE: number;
  readonly DOCUMENT_POSITION_CONTAINED_BY: number;
  readonly DOCUMENT_POSITION_CONTAINS: number;
  readonly DOCUMENT_POSITION_DISCONNECTED: number;
  readonly DOCUMENT_POSITION_FOLLOWING: number;
  readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
  readonly DOCUMENT_POSITION_PRECEDING: number;
  readonly DOCUMENT_TYPE_NODE: number;
  readonly ELEMENT_NODE: number;
  readonly ENTITY_NODE: number;
  readonly ENTITY_REFERENCE_NODE: number;
  readonly NOTATION_NODE: number;
  readonly PROCESSING_INSTRUCTION_NODE: number;
  readonly TEXT_NODE: number;
  addEventListener = unsupported;
  dispatchEvent = unsupported;
  removeEventListener = unsupported;
}

function unsupported(): any {
  throw new Error('Unsupported');
}
