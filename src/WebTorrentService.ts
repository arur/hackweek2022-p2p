// @ts-nocheck
import WebTorrent from 'webtorrent-hybrid';

type SeedInput =
  | string
  | string[]
  | File
  | File[]
  | FileList
  | Buffer
  | Buffer[]
  | NodeJS.ReadableStream
  | NodeJS.ReadableStream[];

type AddInput = string | File | Buffer;

const createWebTorrentService = () => {
  const client: WebTorrent.Instance = new WebTorrent();

  // init() {
  //   this.client.on('torrent', (torrent: WebTorrent.Torrent) => {
  //     console.log('on.torrent', torrent.name, torrent.infoHash);
  //   });

  //   this.client.on('error', err => {
  //     console.log(err);
  //   });
  // }

  const getTorrents = () => {
    return client.torrents;
  };

  const getTorrent = (torrentId: string) => {
    return client.get(torrentId);
  };

  const seed = (input: SeedInput) => {
    client.seed(input, {}, (torrent: WebTorrent.Torrent) => {
      console.log(
        `\nSeeding torrent: ${torrent.name} torrent hash ${torrent.infoHash}`,
      );
    });
  };

  const add = (torrentId: AddInput) => {
    client.add(torrentId, {}, function ontorrent(torrent: WebTorrent.Torrent) {
      torrent.on('done', function () {
        console.log('torrent finished downloading');
        torrent.files.forEach(function (file) {
          console.log(file.path);
        });
      });

      console.log(torrent.path);
    });
  };

  const destroy = () => {
    client.destroy(e => {
      console.log('destroy', e);
    });
  };

  return {
    getTorrents,
    getTorrent,
    seed,
    add,
    destroy,
  };
};

export const torrentService = createWebTorrentService();
