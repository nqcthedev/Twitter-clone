import { TweetAudience, TweetType } from '~/constants/enums';
import { Media } from '../Other';
import { ParamsDictionary, Query } from 'express-serve-static-core';

export interface TweetRequestBody {
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | string; // chi null khi tweet goc, khong thi tweet_id cha dang string
  hashtags: string[]; // ten cua hashtag dang ['javascript', 'reactjs', ]
  mentions: string[]; //user_id[]
  medias: Media[];
}

export interface TweetParam extends ParamsDictionary {
  tweet_id: string;
}

export interface TweetQuery extends Pagination, Query {
  tweet_type: string;
}

export interface Pagination {
  limit: string;
  page: string;
}
