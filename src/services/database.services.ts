import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.shema';
import Follower from '~/models/schemas/Follower.schema';
import VideoStatus from '~/models/schemas/VideoStatus.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import Hashtag from '~/models/schemas/Hashtag.schema';
import Bookmark from '~/models/schemas/Bookmark.schema';
import Like from '~/models/schemas/Like.schema';
//------------------------------------------------------------------------------------------------------
import { envConfig } from '~/constants/config';
const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@twiiter.3jn5msk.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true,
      },
    });

    this.db = this.client.db(process.env.DB_NAME);
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      console.log('Error', error);
    }
  }

  async indexUser() {
    const exits = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1']);
    if (!exits) {
      this.users.createIndex({ email: 1, password: 1 });
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
    }
  }

  async indexRefreshTokens() {
    const exits = await this.users.indexExists(['token_1', 'exp_1']);
    if (!exits) {
      this.refreshTokens.createIndex({ token: 1 });
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    }
  }

  async indexVideoStatus() {
    const exits = await this.users.indexExists(['token_1', 'exp_1']);
    if (!exits) {
      this.videoStatus.createIndex({ name: 1 });
    }
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text']);
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' });
    }
  }

  async indexFollowers() {
    const exits = await this.users.indexExists(['user_id_1', 'followed_user_id_1']);
    if (!exits) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 });
    }
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION_NAME as string);
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION_NAME as string);
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string);
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string);
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string);
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string);
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string);
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string);
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService();
export default databaseService;
