import path from 'node:path';
import repl, { REPLEval } from 'node:repl';
import { Command, CommanderError } from 'commander';
import { torrentService } from './WebTorrentService.js';
import { formatTorrent, formatTorrents } from './format.utils.js';
import cliProgress from 'cli-progress';

import type { Torrent } from 'webtorrent';
import { TorrentInfo } from './types.js';

const mapToInfo = ({
  name,
  infoHash,
  magnetURI,
  created,
  progress
}: Torrent): Partial<Torrent> => ({
  name,
  infoHash,
  magnetURI,
  created,
  progress
});

const program = new Command();
program.exitOverride();
program.showHelpAfterError();

program
  .command('list')
  .description('Get an array of all torrents in the client.')
  .action(() => {
    const torrents = torrentService.getTorrents();
    console.log('\n' + formatTorrents(torrents) + '\n');
  });

program
  .command('info')
  .description('Get an array of all torrents in the client.')
  .argument('<torrentId>', 'torrent hash')
  .action((torrentId: string) => {
    const torrent = torrentService.getTorrent(torrentId);
    if (torrent) {
      console.log('\n' + formatTorrent(torrent) + '\n');

      return;
    }
    console.log(`No torrent found with ${torrentId} hash`);
  });

program
  .command('gml')
  .description('Get the magnet link of the torrent.')
  .argument('<torrentId>', 'torrent hash')
  .action((torrentId: string) => {
    const torrent = torrentService.getTorrent(torrentId);
    if (torrent) {
      console.log(torrent.magnetURI);

      return;
    }
    console.log(`No torrent found with ${torrentId} hash`);
  });

program
  .command('exit')
  .description('Exit the application.')
  .action(() => {
    torrentService.destroy();
    process.exit();
  });

program
  .command('seed')
  .description('Start seeding a new torrent.')
  .argument('<fileName>', 'filesystem path to file or folder')
  .action((fileName: string) => {
    console.log('Preparing file for seeding...');

    const filePath = path.join(process.cwd(), 'assets', fileName);
    torrentService.seed(filePath);
  });

program
  .command('add')
  .description('Add a new torrent to be downloaded.')
  .argument('<torrentId>', 'magnet link or info hash')
  .action(async(torrentId: string) => {
    const returned = torrentService.add(torrentId);
    await sleep(1000);

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(100,0)
    const asyncInterval = new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        const torrents = torrentService.getTorrents();
        var torrentInfo = torrents.map<TorrentInfo>(mapToInfo);
        bar.update(Math.floor(torrentInfo[0].progress * 100))
        if (torrentInfo[0].progress == 1) {
          resolve();
          clearInterval(timer)
        }
      }, 2000)  
    })
    await asyncInterval

  });

const run = async (input: string) => {
  try {
    await program.parseAsync(input.split(' '), { from: 'user' });
  } catch (err) {
    if (
      err instanceof CommanderError &&
      err.code != 'commander.help' &&
      err.code != 'commander.missingArgument' &&
      err.code != 'commander.helpDisplayed' &&
      err.code != 'commander.unknownCommand'
    ) {
      console.log(err);
      return;
    }
    console.log(err);
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const customEval: REPLEval = async (uInput, context, filename, callback) => {
  callback(null, await run(uInput.trim()));
};

console.log('Enter command\n');

repl.start({ prompt: '🚀 ', eval: customEval });
