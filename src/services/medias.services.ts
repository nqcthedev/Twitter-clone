import { getFiles, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file';
import { Request } from 'express';
import sharp from 'sharp';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';
import fsPromise from 'fs/promises';
import { isProduction } from '~/constants/config';
import path from 'path';
import { EncodingStatus, MediaType } from '~/constants/enums';
import { Media } from '~/models/Other';
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video';
import databaseService from './database.services';
import VideoStatus from '~/models/schemas/VideoStatus.schema';
import { uploadToFileS3 } from '~/utils/s3';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import { rimrafSync } from 'rimraf';

class Queue {
  items: string[];
  encoding: boolean;
  constructor() {
    this.items = [];
    this.encoding = false;
  }
  async enqueue(item: string) {
    this.items.push(item);
    const idName = getNameFromFullName(item.split('/').pop() as string);
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending,
      })
    );
    this.processEncode();
  }
  async processEncode() {
    if (this.encoding) return;
    if (this.items.length > 0) {
      this.encoding = true;
      const videoPath = this.items[0];
      const idName = getNameFromFullName(videoPath.split('/').pop() as string);
      await databaseService.videoStatus.updateOne(
        {
          name: idName,
        },
        {
          $set: {
            status: EncodingStatus.Processing,
          },
          $currentDate: {
            update_at: true,
          },
        }
      );
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath);
        this.items.shift();
        await fsPromise.unlink(videoPath);
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName));
        const mime = (await import('mime')).default;
        await Promise.all(
          files.map((filepath) => {
            const filename = 'videos-hls' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '');
            return uploadToFileS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string,
            });
          })
        );
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName));
        await databaseService.videoStatus.updateOne(
          {
            name: idName,
          },
          {
            $set: {
              status: EncodingStatus.Success,
            },
            $currentDate: {
              update_at: true,
            },
          }
        );
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            {
              name: idName,
            },
            {
              $set: {
                status: EncodingStatus.Failed,
              },
              $currentDate: {
                update_at: true,
              },
            }
          )
          .catch((err) => {
            console.error(err);
          });
        console.error(`Encode video ${videoPath} error`);
        console.error(error);
      }
      this.encoding = false;
      this.processEncode();
    } else {
      console.log('Endcode video queue is empty');
    }
  }
}

const queue = new Queue();

class MediasService {
  async uploadImage(req: Request) {
    // console.log('Image', req);
    const mime = (await import('mime')).default;
    const files = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = file.originalFilename as string;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newName);
        await sharp(file.filepath).jpeg().toFile(newPath);
        const s3Result = await uploadToFileS3({
          filename: 'image/' + newName,
          filepath: newPath,
          contentType: mime.getType(newName) as string,
        });
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)]);
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image,
        };
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFileName}.jpg`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}.jpg`,
        //   type: MediaType.Image,
        // };
      })
    );
    return result;
  }

  async uploadVideo(req: Request) {
    const mime = (await import('mime')).default;
    const files = await handleUploadVideo(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // console.log('filePath', file.filepath);
        const s3Result = await uploadToFileS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath,
        });
        fsPromise.unlink(file.filepath);
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video,
        };
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    );
    return result;
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        queue.enqueue(file.filepath);
        const newName = getNameFromFullName(file.newFilename);
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS,
        };
      })
    );
    return result;
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id });
    return data;
  }
}

const mediasService = new MediasService();

export default mediasService;
