export interface IntcodeState {
  p: number[],
  input: number[],
  output: number[],
  i: number,
  done: boolean,
  parmode: [number, number, number],
  rel_base: number,
}

export enum ProgramResult {
  Continue,
  Halt,
  Wait,
}

function readMemory(p: number[], x: number): number {
  if (x >= p.length) {
    return 0;
  } else {
    return p[x];
  }
}

function writeMemory(p: number[], x: number, v: number) {
  if (x >= p.length) {
    for (let i = p.length; i <= x; i++) {
      p.push(0);
    }
  }

  p[x] = v;
}

function getParamAddr(state: IntcodeState, n: number): number {
  if (n < 0 || n > 2) {
    throw new Error(`Invalid parameter position: ${n}`);
  }

  let {p, i, parmode, rel_base} = state;

  switch (parmode[n]) {
    case 0:
      return readMemory(p, i + n + 1);

    case 1:
      return i + n + 1;

    case 2:
      return rel_base + readMemory(p, i + n + 1);

    default:
      throw new Error(`Invalid parameter mode: ${parmode[n]}`);
  }
}

function getParamVal(state: IntcodeState, n: number): number {
  return readMemory(state.p, getParamAddr(state, n));
}

function setParamVal(state: IntcodeState, n: number, v: number) {
  writeMemory(state.p, getParamAddr(state, n), v);
}

interface Instruction {
  (state: IntcodeState): ProgramResult;
}

function add(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a + b);
  state.i += 4;

  return ProgramResult.Continue;
}

function mult(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a*b);
  state.i += 4;

  return ProgramResult.Continue;
}

function read(state: IntcodeState): ProgramResult {
  let n = state.input.shift();
  if (n === undefined) {
    return ProgramResult.Wait;
  }

  setParamVal(state, 0, n);
  state.i += 2;

  return ProgramResult.Continue;
}

function write(state: IntcodeState): ProgramResult {
  const n = getParamVal(state, 0);
  state.output.push(n);
  state.i += 2;

  return ProgramResult.Continue;
}

function jump_if_true(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  if (a != 0) {
    state.i = getParamVal(state, 1);
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function jump_if_false(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  if (a == 0) {
    state.i = getParamVal(state, 1);
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function less_than(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a < b ? 1 : 0);
  state.i += 4;

  return ProgramResult.Continue;
}

function equals(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a == b ? 1 : 0);
  state.i += 4;

  return ProgramResult.Continue;
}

function adjust_rel_base(state: IntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  state.rel_base += a;
  state.i += 2;

  return ProgramResult.Continue;
}

function halt(_: IntcodeState) {
  return ProgramResult.Halt;
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
  9: adjust_rel_base,
  99: halt
}

export function startIntcode(p: number[], input: number[] = []): IntcodeState {
  return {
    p: p,
    input: input,
    output: [],
    i: 0,
    done: false,
    parmode: [0, 0, 0],
    rel_base: 0,
  };
}

export function wakeIntcode(state: IntcodeState): ProgramResult {
  while (true) {
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
    const result = instr(state);
    switch (result) {
      case ProgramResult.Continue:
        break;

      case ProgramResult.Halt:
        state.done = true;
        // fallthrough
      case ProgramResult.Wait:
        return result;
    }
  }
}

export function runIntcode(p: number[], input: number[] = []): number[] {
  let state = startIntcode(p, input);

  while (true) {
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
    const result = instr(state);
    switch (result) {
      case ProgramResult.Continue:
        break;

      case ProgramResult.Wait:
        throw new Error("Program waiting for input");

      case ProgramResult.Halt:
        return state.output;
    }
  }
}
