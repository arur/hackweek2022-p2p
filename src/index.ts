import repl, { REPLEval } from 'node:repl';
import { Command, CommanderError } from 'commander';
import { torrentService } from './WebTorrentService.js';
import path from 'node:path';
import WebTorrent from 'webtorrent';
import cliProgress from 'cli-progress';

type TorrentInfo = Pick<
  WebTorrent.Torrent,
  'name' | 'infoHash' | 'magnetURI' | 'timeRemaining' | 'progress'
>;

const mapToInfo = ({
  name,
  infoHash,
  magnetURI,
  timeRemaining,
  progress,
}: WebTorrent.Torrent): TorrentInfo => ({
  name,
  infoHash,
  magnetURI,
  timeRemaining,
  progress,
});

const program = new Command();
program.exitOverride();
program.showHelpAfterError();

program
  .command('list')
  .description('Get an array of all torrents in the client.')
  .action(() => {
    const torrents = torrentService.getTorrents();
    const torrentInfo = torrents.map<TorrentInfo>(mapToInfo);
    console.log(torrentInfo);
  });

program
  .command('info')
  .description('Get an array of all torrents in the client.')
  .argument('<torrentId>', 'torrent hash')
  .action((torrentId: string) => {
    const torrent = torrentService.getTorrent(torrentId);
    if (torrent) {
      console.log(mapToInfo(torrent));
      return;
    }
    console.log(`No torrent fount with ${torrentId} hash`);
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
    const filePath = path.join(process.cwd(), 'assets', fileName);
    torrentService.seed(filePath);
  });

program
  .command('add')
  .description('Add a new torrent to be downloaded.')
  .argument('<torrentId>', 'magnet link or info hash')
  .action(async(torrentId: string) => {
    const returned = torrentService.add(torrentId);
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(1,0)

    const asyncInterval = new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        const torrents = torrentService.getTorrents();
        var torrentInfo = torrents.map<TorrentInfo>(mapToInfo);
        bar.update(torrentInfo[0].progress)
        if (torrentInfo[0].progress == 1) {
          bar.stop()
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
    }
  }
};

const customEval: REPLEval = async (uInput, context, filename, callback) => {
  callback(null, await run(uInput.trim()));
};

console.log('Enter command\n');

repl.start({ prompt: '🚀 ', eval: customEval });
