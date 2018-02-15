import { spawn } from 'child_process';

let verdaccio = null;

export function boot(done) {

  if (verdaccio) {
    return;
  }

  spawn('npm', ['set', 'registry', 'http://localhost:4873']);
  verdaccio = spawn('verdaccio');
  verdaccio.on('error', done);
  verdaccio.on('close', done);
}


export function kill() {
  if (!verdaccio) {
    return;
  }

  verdaccio.kill();
  verdaccio = null;
}