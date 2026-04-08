export interface YoutubeRssVideo {
  _id: string;
  title: string;
  thumb: string;
  channelName?: string;
  watchLater?: boolean;
}

export interface ChannelRanking {
  channelName: string;
  count: number;
}
