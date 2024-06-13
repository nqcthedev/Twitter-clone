import { ObjectId } from 'mongodb';
import { EncodingStatus } from '~/constants/enums';

interface VideoStatusType {
  _id?: ObjectId;
  name: string;
  status: EncodingStatus;
  message?: string;
  create_at?: Date;
  update_at?: Date;
}

export default class VideoStatus {
  _id?: ObjectId;
  name: string;
  status: EncodingStatus;
  message: string;
  create_at?: Date;
  update_at?: Date;
  constructor({ name, status, _id, create_at, update_at, message }: VideoStatusType) {
    const date = new Date();
    this._id = _id;
    this.name = name;
    this.status = status;
    this.message = message || '';
    this.create_at = create_at || date;
    this.update_at = update_at || date;
  }
}
