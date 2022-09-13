import path from "path";
import { WebTorrentService } from "./WebTorrentService";

const run = () => {
  const p = path.join(__dirname, '..', 'assets', 'editor.txt')
  console.log(p);

  const webTorrent  = new WebTorrentService();
  webTorrent.init();

  webTorrent.seed(p);

}
run();
