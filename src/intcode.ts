export interface IIntcodeState {
  done: boolean;
  i: number;
  input: number[];
  output: number[];
  p: number[];
  parmode: [number, number, number];
  relBase: number;
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

function getParamAddr(state: IIntcodeState, n: number): number {
  if (n < 0 || n > 2) {
    throw new Error(`Invalid parameter position: ${n}`);
  }

  const {p, i, parmode, relBase} = state;

  switch (parmode[n]) {
    case 0:
      return readMemory(p, i + n + 1);

    case 1:
      return i + n + 1;

    case 2:
      return relBase + readMemory(p, i + n + 1);

    default:
      throw new Error(`Invalid parameter mode: ${parmode[n]}`);
  }
}

function getParamVal(state: IIntcodeState, n: number): number {
  return readMemory(state.p, getParamAddr(state, n));
}

function setParamVal(state: IIntcodeState, n: number, v: number) {
  writeMemory(state.p, getParamAddr(state, n), v);
}

type Instruction = (state: IIntcodeState) => ProgramResult;

function add(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a + b);
  state.i += 4;

  return ProgramResult.Continue;
}

function mult(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a * b);
  state.i += 4;

  return ProgramResult.Continue;
}

function read(state: IIntcodeState): ProgramResult {
  const n = state.input.shift();
  if (n === undefined) {
    return ProgramResult.Wait;
  }

  setParamVal(state, 0, n);
  state.i += 2;

  return ProgramResult.Continue;
}

function write(state: IIntcodeState): ProgramResult {
  const n = getParamVal(state, 0);
  state.output.push(n);
  state.i += 2;

  return ProgramResult.Continue;
}

function jump_if_true(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  if (a !== 0) {
    state.i = getParamVal(state, 1);
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function jump_if_false(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  if (a === 0) {
    state.i = getParamVal(state, 1);
  } else {
    state.i += 3;
  }

  return ProgramResult.Continue;
}

function less_than(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a < b ? 1 : 0);
  state.i += 4;

  return ProgramResult.Continue;
}

function equals(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  const b = getParamVal(state, 1);
  setParamVal(state, 2, a === b ? 1 : 0);
  state.i += 4;

  return ProgramResult.Continue;
}

function adjust_relBase(state: IIntcodeState): ProgramResult {
  const a = getParamVal(state, 0);
  state.relBase += a;
  state.i += 2;

  return ProgramResult.Continue;
}

function halt(_: IIntcodeState) {
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
  9: adjust_relBase,
  99: halt,
};

export function startIntcode(p: number[], input: number[] = []): IIntcodeState {
  return {
    done: false,
    i: 0,
    input,
    output: [],
    p,
    parmode: [0, 0, 0],
    relBase: 0,
  };
}

export function wakeIntcode(state: IIntcodeState): ProgramResult {
  while (true) {
    let instrN = state.p[state.i];
    const opcode = instrN % 100;
    instrN = Math.trunc(instrN / 100);

    state.parmode[0] = instrN % 10;
    instrN = Math.trunc(instrN / 10);
    state.parmode[1] = instrN % 10;
    instrN = Math.trunc(instrN / 10);
    state.parmode[2] = instrN % 10;
    instrN = Math.trunc(instrN / 10);

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
  const state = startIntcode(p, input);

  while (true) {
    let instrN = state.p[state.i];
    const opcode = instrN % 100;
    instrN = Math.trunc(instrN / 100);

    state.parmode[0] = instrN % 10;
    instrN = Math.trunc(instrN / 10);
    state.parmode[1] = instrN % 10;
    instrN = Math.trunc(instrN / 10);
    state.parmode[2] = instrN % 10;
    instrN = Math.trunc(instrN / 10);

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
