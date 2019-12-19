export interface IntcodeState {
  p: number[]
  input: number[]
  output: number[]
  i: number
  done: boolean,
  parmode: [number, number, number]
}

export enum ProgramResult {
  Continue,
  Halt,
  Wait,
}

function getParamAddr(state: IntcodeState, n: number): number {
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
  (state: IntcodeState): ProgramResult;
}

function add(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a + b;
  state.i += 4;

  return ProgramResult.Continue;
}

function mult(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a*b;
  state.i += 4;

  return ProgramResult.Continue;
}

function read(state: IntcodeState): ProgramResult {
  let {p, input} = state;

  let n = input.shift();
  if (n === undefined) {
    return ProgramResult.Wait;
  }

  p[getParamAddr(state, 0)] = n;
  state.i += 2;

  return ProgramResult.Continue;
}

function write(state: IntcodeState): ProgramResult {
  let {p, output} = state;

  const n = p[getParamAddr(state, 0)];
  output.push(n);
  state.i += 2;

  return ProgramResult.Continue;
}

function jump_if_true(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  if (a != 0) {
    state.i = p[getParamAddr(state, 1)];
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function jump_if_false(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  if (a == 0) {
    state.i = p[getParamAddr(state, 1)];
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function less_than(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a < b ? 1 : 0;
  state.i += 4;

  return ProgramResult.Continue;
}

function equals(state: IntcodeState): ProgramResult {
  let {p} = state;
  const a = p[getParamAddr(state, 0)];
  const b = p[getParamAddr(state, 1)];
  p[getParamAddr(state, 2)] = a == b ? 1 : 0;
  state.i += 4;

  return ProgramResult.Continue;
}

function halt(state: IntcodeState) {
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
