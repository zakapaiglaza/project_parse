import { DOMParserImpl } from 'xmldom-ts';
import { executeTests } from './tests';

executeTests('xmldom', DOMParserImpl, false);
