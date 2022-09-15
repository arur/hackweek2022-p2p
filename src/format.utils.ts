import type { Torrent } from 'webtorrent';
import type { TorrentInfo } from './types.js';

const ELLIPSIS = '…';
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
});

const getLongestName = (torrentInfoList: TorrentInfo[], maxLength = 24) =>
  Math.max(
    ...torrentInfoList.map(({ name }) =>
      name.length < maxLength ? name.length : maxLength,
    ),
  );

export const infoToString = ({
  infoHash,
  created,
  name,
  files,
  ready,
  done,
  paused,
  magnetURI,
  progress
}: Torrent): TorrentInfo => ({
  infoHash,
  created: created
    ? dateFormatter.format(new Date(created)).replace(',', '')
    : undefined,
  name,
  filesCount: String(files.length),
  ready: ready ? '✅' : ' ',
  done: done ? '✅' : ' ',
  paused: paused ? '⏸' : ' ',
  magnetURI,
  progress
});

export const formatTorrentInfoLine = (
  torrentInfo: TorrentInfo,
  nameColumnLength = 24,
) => {
  const { infoHash, created, filesCount, ready, done, name } = torrentInfo;

  const torrentName =
    name.length > nameColumnLength
      ? `${name.slice(0, nameColumnLength - 1)}${ELLIPSIS}`
      : name;

  const createdString = created ? created : ' '.repeat(12);

  return `${infoHash}  ${createdString}  ${filesCount.padStart(
    5,
    ' ',
  )}  ${ready.padEnd(5, ' ')} ${done.padEnd(5, ' ')} ${torrentName}`;
};

/*
hash                                      created       files  ready  done   name
*/
export const formatTorrentInfoHeader = () => {
  return `${'hash'.padEnd(40, ' ')}  ${'created'.padEnd(
    12,
    ' ',
  )}  files  ready  done   name`;
};

export const formatTorrent = (torrent: Torrent) => {
  return (
    formatTorrentInfoHeader() +
    '\n' +
    formatTorrentInfoLine(infoToString(torrent))
  );
};

export const formatTorrents = (torrents: Torrent[]) => {
  const torrentInfoList = torrents.map(infoToString);
  const maxNameLength = getLongestName(torrentInfoList);

  return (
    formatTorrentInfoHeader() +
    '\n' +
    torrentInfoList.map(t => formatTorrentInfoLine(t, maxNameLength)).join('\n')
  );
};
