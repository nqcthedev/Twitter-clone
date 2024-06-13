import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { LIKES_MESSAGE } from '~/constants/messages';
import { LikeTweetReqBody } from '~/models/requests/Like.request';

import { TokenPayload } from '~/models/requests/User.request';

import likeService from '~/services/likes.services';

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likeService.likeTweet(user_id, req.body.tweet_id);
  return res.json({
    message: LIKES_MESSAGE.LIKES_SUCCESS,
    result,
  });
};

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  await likeService.unLikeTweet(user_id, req.params.tweet_id);
  return res.json({
    message: LIKES_MESSAGE.UNLIKES_SUCCESS,
  });
};
