interface State {
  p: number[]
  input: number[]
  output: number[]
  i: number
  done: boolean
  parmode: [number, number, number]
}

function getParamAddr(state: State, n: number): number {
  if (n < 0 || n > 2) {
    throw new Error(`Invalid parameter position: ${n}`);
  }

  switch (state.parmode[n]) {
    case 0:
      return state.p[state.i + n + 1];

    case 1:
      return state.i + n + 1;

    default:
      throw new Error(`Invalid parameter mode: ${state.parmode[n]}`);
  }
}

interface Instruction {
  (state: State): void;
}

function add(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a + b;
  state.i += 4;
}

function mult(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a*b;
  state.i += 4;
}

function read(state: State) {
  let {p, input} = state;

  let n = input.shift();
  if (n === undefined) {
    throw new Error("Input is empty");
  }

  p[getParamAddr(state, 0)] = n;
  state.i += 2;
}

function write(state: State) {
  let {p, output} = state;

  const n = p[getParamAddr(state, 0)];
  output.push(n);
  state.i += 2;
}

function jump_if_true(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  if (a != 0) {
    state.i = p[getParamAddr(state, 1)];
  } else {
    state.i += 3;
  }
}

function jump_if_false(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  if (a == 0) {
    state.i = p[getParamAddr(state, 1)];
  } else {
    state.i += 3;
  }
}

function less_than(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a < b ? 1 : 0;
  state.i += 4;
}

function equals(state: State) {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a == b ? 1 : 0;
  state.i += 4;
}

function halt(state: State) {
  state.done = true;
}

const INSTRUCTIONS: {[id: number]: Instruction} = {
  1: add,
  2: mult,
  3: read,
  4: write,
  5: jump_if_true,
  6: jump_if_false,
  7: less_than,
  8: equals,
  99: halt
}

export function runIntcode(p: number[], input: number[] = []): number[] {
  let state: State = {
    p: p,
    input: input,
    output: [],
    i: 0,
    done: false,
    parmode: [0, 0, 0],
  };

  while (!state.done) {
    let instr_n = state.p[state.i];
    const opcode = instr_n % 100;
    instr_n = instr_n / 100 | 0;

    state.parmode[0] = instr_n % 10;
    instr_n = instr_n / 10 | 0;
    state.parmode[1] = instr_n % 10;
    instr_n = instr_n / 10 | 0;
    state.parmode[2] = instr_n % 10;
    instr_n = instr_n / 10 | 0;

    const instr = INSTRUCTIONS[opcode];
    instr(state);
  }

  return state.output;
}
