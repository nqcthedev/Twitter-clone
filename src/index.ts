import express from 'express';
import userRouter from './routes/users.routes';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import cors, { CorsOptions } from 'cors';
import mediasRouter from './routes/medias.routes';
import { initFolder } from './utils/file';
import staticRouter from './routes/static.routes';
import { UPLOAD_VIDEO_DIR } from './constants/dir';
import databaseService from './services/database.services';
import tweetsRouter from './routes/tweets.routes';
import bookmarksRouter from './routes/bookmarks.routes';
import likesRouter from './routes/likes.routes';
// import '~/utils/fake'
import searchRouter from './routes/search.routes';
import '~/utils/s3';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import helmet from 'helmet';
import { envConfig, isProduction } from './constants/config';
import { rateLimit } from 'express-rate-limit';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0',
    },
  },
  apis: ['./openapi/*.yaml'],
};

const openapiSpecification = swaggerJsdoc(options);
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*',
};
databaseService.connect().then(() => {
  databaseService.indexUser();
  databaseService.indexRefreshTokens();
  databaseService.indexVideoStatus();
  databaseService.indexFollowers();
  databaseService.indexTweets();
});
databaseService.connect();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

const httpServer = createServer(app);
const port = envConfig.port || 4000;
initFolder();
app.use(limiter);
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use('/users', userRouter);
app.use('/medias', mediasRouter);
app.use('/tweets', tweetsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/likes', likesRouter);
app.use('/search', searchRouter);
app.use('/static', staticRouter);
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR));
app.use(defaultErrorHandler);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket: Socket) => {});

httpServer.listen(port),
  () => {
    console.log(`Example app listening on port ${port}`);
  };
