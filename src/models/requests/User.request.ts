import { ParamsDictionary } from 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';
import { TokenType, UserVerifyStatus } from '~/constants/enums';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: tdemo017+8@gmail.com
 *         password:
 *           type: string
 *           example: 'Cuongdola1@'
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         result:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVmMmFlMWJmZWQ3MmE0ZDVmMmVmMWMyIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE3MTQyOTI4MjcsImV4cCI6MTcxNDI5MzcyN30.n4DMESBCHTm00hxgRmlyManklHIGsYPe-UEye2WbF6s
 *             refresh_token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVmMmFlMWJmZWQ3MmE0ZDVmMmVmMWMyIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE3MTQyOTI4MjcsImV4cCI6MTcyMjkzMjgyN30.VXZFK_EJMMUp6UNXl7L3JB6bLknVoIxpdiC_L_PK9Yo
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: '65f2ae1bfed72a4d5f2ef1c2'
 *         name:
 *           type: string
 *           example: 'dola98'
 *         email:
 *           type: string
 *           example: 'tdemo017+8@gmail.com'
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           example: '2023-04-08T10:17:31.096Z'
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: '2024-03-14T07:58:19.213Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: '2024-03-14T08:01:01.766Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *           example: [65f2ae1bfed72a4d5f2ef1c2, 65f2ae1bfed72a4d5f2ef1c2, 65f2ae1bfed72a4d5f2ef1c2]
 *         bio:
 *           type: string
 *           example: ''
 *         location:
 *           type: string
 *           example: ''
 *         website:
 *           type: string
 *           example: ''
 *         username:
 *           type: string
 *           example: 'user65f2ae1bfed72a4d5f2ef1c2'
 *         avatar:
 *           type: string
 *           example: 'http://localhost:4000/images/avatars/johndoe.jpg'
 *         cover_photo:
 *           type: string
 *           example: 'http://localhost:4000/images/avatars/cover_photo.jpg'
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verify, Banned]
 *       example: 1
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export interface LoginReqBody {
  email: string;
  password: string;
}

export interface UpdateMeReqBody {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface FollowReqBody {
  followed_user_id: string;
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string;
}

export interface VerifyEmailReqBody {
  email_verify_token: string;
}

export interface GetProfileReqProfileParams extends ParamsDictionary {
  username: string;
}

export interface ForgotRequestReqBody {
  email: string;
}

export interface ForgotPasswordReqBody {
  forgot_password_token: string;
}

export interface ResetPasswordReqBody {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
}

export interface ChangePasswordReqBody {
  old_password: string;
  password: string;
  confirm_password: string;
}

export interface RegisterReqBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}

export interface TokenPayload extends JwtPayload {
  user_id: string;
  token_type: TokenType;
  verify: UserVerifyStatus;
  exp: number;
  iat: number;
}

export interface LogoutReqBody {
  refresh_token: string;
}

export interface RefreshTokenBody {
  refresh_token: string;
}
