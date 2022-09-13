import repl, {REPLEval} from 'node:repl';
import {Command, CommanderError} from 'commander';
import {torrentService} from './WebTorrentService.js';

const program = new Command();
program.exitOverride();
program.showHelpAfterError();

program
  .command('list')
  .description('Get an array of all torrents in the client.')
  .action(() => {
    console.log(torrentService.getTorrents());
  });

program
  .command('exit')
  .description('Exit the application.')
  .action(() => {
    torrentService.destroy();
    process.exit();
  });

program
  .command('add')
  .description('Start seeding a new torrent.')
  .argument('<file>', 'filesystem path to file or folder')
  .action((file: string) => {
    // torrentService.seed('editor.txt');
    console.log(process.cwd());
    console.log(file);
  });

const run = async (input: string) => {
  try {
    await program.parseAsync(input.split(' '), {from: 'user'});
  } catch (err) {
    if (
      err instanceof CommanderError &&
      err.code != 'commander.help' &&
      err.code != 'commander.missingArgument' &&
      err.code != 'commander.helpDisplayed'
    ) {
      console.log(err);
    }
  }
};

const customEval: REPLEval = async (uInput, context, filename, callback) => {
  callback(null, await run(uInput.trim()));
};

console.log('Enter command\n');

repl.start({prompt: '🚀 ', eval: customEval});
