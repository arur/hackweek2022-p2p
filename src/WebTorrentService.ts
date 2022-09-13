import WebTorrent from "webtorrent";

export class WebTorrentService {
  private client: WebTorrent.Instance;

  constructor () {
    this.client = new WebTorrent();
  }

  init() {
    this.client.on('torrent', (torrent: WebTorrent.Torrent) => {
      console.log('on.torrent', torrent.name, torrent.infoHash)
    })
    
    this.client.on('error', (err) => {
      console.log(err)
    })
  }
  
  seed(input: string | string[] | File | File[] | FileList | Buffer | Buffer[] | NodeJS.ReadableStream | NodeJS.ReadableStream[]) {
    this.client.seed(input, {}, (torrent: WebTorrent.Torrent) => {
      console.log('seed',torrent.name)
    })
  }

  destroy () {
    this.client.destroy((e) => {
      console.log('destroy', e)
    });
  }

}