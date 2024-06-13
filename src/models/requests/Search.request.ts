import { MediaTypeQuery, PeopleFollow } from '~/constants/enums';
import { Query } from 'express-serve-static-core';
import { Pagination } from './Tweet.request';

export interface SearchQuery extends Pagination, Query {
  content: string;
  media_type?: MediaTypeQuery;
  people_follow?: PeopleFollow;
}
