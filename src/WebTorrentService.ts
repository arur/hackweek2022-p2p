import WebTorrent from 'webtorrent';

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

  const seed = (input: SeedInput) => {
    client.seed(input, {}, (torrent: WebTorrent.Torrent) => {
      console.log('seed', torrent.name);
    });
  };

  const destroy = () => {
    client.destroy(e => {
      console.log('destroy', e);
    });
  };

  return {
    getTorrents,
    seed,
    destroy,
  };
};

export const torrentService = createWebTorrentService();
