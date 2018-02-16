import { spawn, ChildProcess } from 'child_process';

let verdaccio: ChildProcess = null;

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
  spawn('npm', ['config', 'delete', 'registry']);
  verdaccio.kill();
  verdaccio = null;
}