import { JSDOM } from 'jsdom';
import { executeTests } from './tests';

executeTests('jsdom', new JSDOM().window.DOMParser, true);
