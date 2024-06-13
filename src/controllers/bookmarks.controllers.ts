import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { BOOKMARKS_MESSAGE } from '~/constants/messages';
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.request';

import { TokenPayload } from '~/models/requests/User.request';
import bookmarkService from '~/services/bookmark.services';

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id);
  return res.json({
    message: BOOKMARKS_MESSAGE.BOOKMARK_SUCCESS,
    result,
  });
};

export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id);
  return res.json({
    message: BOOKMARKS_MESSAGE.UNBOOKMARK_SUCCESS,
  });
};
