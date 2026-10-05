export interface YoutubeRssVideo {
  _id: string;
  title: string;
  thumb: string;
  channelName?: string;
  watchLater?: boolean;
  createdAt: string;
}

export interface ChannelRanking {
  channelName: string;
  count: number;
  ignoredUntil?: string | null;
}
