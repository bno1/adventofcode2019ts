interface State {
  p: number[]
  i: number
  done: boolean
}

interface Instruction {
  (state: State): void;
}

function add(state: State) {
  let {i, p} = state;
  const a = p[p[i+1]];
  const b = p[p[i+2]];
  p[p[i+3]] = a+b;
  state.i += 4;
}

function mult(state: State) {
  let {i, p} = state;
  const a = p[p[i+1]];
  const b = p[p[i+2]];
  p[p[i+3]] = a*b;
  state.i += 4;
}

function halt(state: State) {
  state.done = true;
}

const INSTRUCTIONS: {[id: number]: Instruction} = {
  1: add,
  2: mult,
  99: halt
}

export function runIntcode(p: number[]) {
  let state: State = {
    p: p,
    i: 0,
    done: false
  };

  while (!state.done) {
    const instr = INSTRUCTIONS[state.p[state.i]];
    instr(state);
  }
}
