import { Expression, VariableResolver } from './xpath-types';

export class VariableResolverImpl implements VariableResolver {
  getVariable(_ln: string, _ns: string): Expression | null {
    return null;
  }
}
