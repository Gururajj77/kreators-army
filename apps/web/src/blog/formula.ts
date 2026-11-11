// The calculator widget's formulas (FORMAT.md §5, calculator). A tiny arithmetic language, parsed and evaluated here without eval or new Function
// (the CSP has no 'unsafe-eval'), so the renderer and the validator compute the same numbers.
//
//   numbers 12  0.5      keys  people  keepRate      + - * / and ( )      unary minus
//   min(a, b, …)  max(a, b, …)  round(x)  round(x, digits)  floor(x)  ceil(x)  abs(x)

export type FormulaNode =
  | { op: 'num'; value: number }
  | { op: 'key'; name: string }
  | { op: 'neg'; arg: FormulaNode }
  | { op: '+' | '-' | '*' | '/'; left: FormulaNode; right: FormulaNode }
  | { op: 'call'; fn: FormulaFn; args: FormulaNode[] };

/** Each function's [fewest, most] arguments. */
export const FORMULA_FUNCTIONS = { min: [2, 9], max: [2, 9], round: [1, 2], floor: [1, 1], ceil: [1, 1], abs: [1, 1] } as const;
export type FormulaFn = keyof typeof FORMULA_FUNCTIONS;

export type FormulaParse = { ok: true; node: FormulaNode; keys: string[] } | { ok: false; error: string };

type Token = { t: 'num'; v: number } | { t: 'name'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Token[] | string {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i] as string;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (num) {
      out.push({ t: 'num', v: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const name = /^[A-Za-z][A-Za-z0-9]*/.exec(src.slice(i));
    if (name) {
      out.push({ t: 'name', v: name[0] });
      i += name[0].length;
      continue;
    }
    if ('+-*/(),'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    return `unexpected "${c}" at ${i}`;
  }
  return out;
}

export function parseFormula(src: string): FormulaParse {
  const tokens = tokenize(src);
  if (typeof tokens === 'string') return { ok: false, error: tokens };
  let pos = 0;
  const keys = new Set<string>();
  const peek = () => tokens[pos];
  const isOp = (v: string) => {
    const t = peek();
    return t?.t === 'op' && t.v === v;
  };
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`expected "${v}"`);
    pos++;
  };

  const expr = (): FormulaNode => {
    let left = term();
    while (isOp('+') || isOp('-')) {
      const op = (tokens[pos++] as { v: '+' | '-' }).v;
      left = { op, left, right: term() };
    }
    return left;
  };
  const term = (): FormulaNode => {
    let left = factor();
    while (isOp('*') || isOp('/')) {
      const op = (tokens[pos++] as { v: '*' | '/' }).v;
      left = { op, left, right: factor() };
    }
    return left;
  };
  const factor = (): FormulaNode => {
    if (isOp('-')) {
      pos++;
      return { op: 'neg', arg: factor() };
    }
    if (isOp('+')) {
      pos++;
      return factor();
    }
    return primary();
  };
  const primary = (): FormulaNode => {
    const t = peek();
    if (!t) throw new Error('unexpected end');
    if (t.t === 'num') {
      pos++;
      return { op: 'num', value: t.v };
    }
    if (t.t === 'name') {
      pos++;
      if (isOp('(')) {
        if (!(t.v in FORMULA_FUNCTIONS)) throw new Error(`unknown function ${t.v}()`);
        const fn = t.v as FormulaFn;
        pos++;
        const args: FormulaNode[] = [];
        if (!isOp(')')) {
          args.push(expr());
          while (isOp(',')) {
            pos++;
            args.push(expr());
          }
        }
        expect(')');
        const [lo, hi] = FORMULA_FUNCTIONS[fn];
        if (args.length < lo || args.length > hi) throw new Error(`${fn}() takes ${lo === hi ? lo : `${lo} to ${hi}`} arguments`);
        return { op: 'call', fn, args };
      }
      keys.add(t.v);
      return { op: 'key', name: t.v };
    }
    if (t.v === '(') {
      pos++;
      const inner = expr();
      expect(')');
      return inner;
    }
    throw new Error(`unexpected "${t.v}"`);
  };

  try {
    if (!tokens.length) return { ok: false, error: 'empty formula' };
    const node = expr();
    if (pos < tokens.length) throw new Error(`unexpected "${String((tokens[pos] as Token).v)}"`);
    return { ok: true, node, keys: [...keys] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** The value, or NaN when a key is missing. Division by zero gives Infinity or NaN: show "–" for any non-finite result. */
export function evalFormula(node: FormulaNode, values: Readonly<Record<string, number>>): number {
  switch (node.op) {
    case 'num':
      return node.value;
    case 'key':
      return values[node.name] ?? Number.NaN;
    case 'neg':
      return -evalFormula(node.arg, values);
    case '+':
      return evalFormula(node.left, values) + evalFormula(node.right, values);
    case '-':
      return evalFormula(node.left, values) - evalFormula(node.right, values);
    case '*':
      return evalFormula(node.left, values) * evalFormula(node.right, values);
    case '/':
      return evalFormula(node.left, values) / evalFormula(node.right, values);
    case 'call': {
      const a = node.args.map((n) => evalFormula(n, values));
      switch (node.fn) {
        case 'min':
          return Math.min(...a);
        case 'max':
          return Math.max(...a);
        case 'round': {
          const f = 10 ** (a[1] ?? 0);
          return Math.round((a[0] as number) * f) / f;
        }
        case 'floor':
          return Math.floor(a[0] as number);
        case 'ceil':
          return Math.ceil(a[0] as number);
        case 'abs':
          return Math.abs(a[0] as number);
      }
    }
  }
}

/**
 * Every output of a calculator, in order: each output may use the inputs and the outputs above it. Returns NaN for an output whose formula does
 * not parse.
 */
export function runCalculator(
  inputs: readonly { key: string }[],
  outputs: readonly { key: string; formula: string }[],
  values: Readonly<Record<string, number>>,
): Record<string, number> {
  const scope: Record<string, number> = {};
  for (const input of inputs) scope[input.key] = values[input.key] ?? Number.NaN;
  for (const out of outputs) {
    const parsed = parseFormula(out.formula);
    scope[out.key] = parsed.ok ? evalFormula(parsed.node, scope) : Number.NaN;
  }
  return scope;
}
