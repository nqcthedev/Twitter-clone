import fs from 'fs';
import * as formidable from 'formidable';
import { File } from 'formidable';
import { Request } from 'express';
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import path from 'path';

export const initFolder = () => {
  [UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true, // mục đích là để tạo folder nested
      });
    }
  });
};

export const handleUploadImage = async (req: Request) => {
  const form = new formidable.IncomingForm({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFields: 4,
    keepExtensions: true,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    },
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files.image as File[]);
    });
  });
};

// Cach 1: Tao unique id cho video ngay tu dau
// Cach 2: Doi video upload xong roi tao folder, move video vao

// Cach xu ly khi upload video encode
// Co 2 giai doan
// Upload video: Upload video thanh cong thi resolve ve cho nguoi dung

export const handleUploadVideo = async (req: Request) => {
  const nanoId = (await import('nanoid')).nanoid;
  const idName = nanoId();
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName);
  fs.mkdirSync(folderPath);
  const form = new formidable.IncomingForm({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR, idName),
    maxFields: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid =
        name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'));
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    },
    filename: function () {
      return idName;
    },
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!files.video) {
        return reject(new Error('File is empty'));
      }
      const videos = files.video as File[];
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string);
        fs.renameSync(video.filepath, video.filepath + '.' + ext);
        video.newFilename = video.newFilename + '.' + ext;
        video.filepath = video.filepath + '.' + ext;
      });

      resolve(files.video as File[]);
    });
  });
};

export const getNameFromFullName = (fullName: string) => {
  const namearr = fullName.split('.');
  namearr.pop();
  return namearr.join('');
};

export const getExtension = (fullname: string) => {
  const nameArr = fullname.split('.');
  return nameArr[nameArr.length - 1];
};



export const getFiles = (dir: string, files: string[] = []) => {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}

