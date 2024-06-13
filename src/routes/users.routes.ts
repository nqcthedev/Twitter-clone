import { Router } from 'express';
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendverifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unFollowController,
  changePasswordController,
  oauthController,
  refreshTokenController,
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middlewares';
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
} from '~/middlewares/users.middlewares';
import { UpdateMeReqBody } from '~/models/requests/User.request';
import { wrapRequestHandler } from '~/utils/handlers';

const usersRouter = Router();

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - users
 *     summary: Login
 *     description: Login to application
 *     operationId: login
 *     requestBody:
 *       description: Info login to application
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *       required: true
 *     responses:
 *       '200':
 *         description: Login Successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login Success
 *                 result:
 *                   $ref: '#/components/schemas/SuccessAuthentication'
 *       '404':
 *         description: Not found
 *       '422':
 *         description: Validation exception
 * /users/me:
 *   get:
 *     tags:
 *       - users
 *     summary: Get user profile
 *     description: Retrieve the profile of the current user
 *     operationId: getMe
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       default:
 *         description: Get me Successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get my profile success
 *                 result:
 *                   $ref: '#/components/schemas/UserProfile'
 */
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Description Login a user
 * Path: /login
 * Method: POST
 * Body:{email:string, password:string}
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * Description: Oauth with Google
 * Path: /oauth/google
 * Method: GET
 * Query: {code:string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController));

/**
 * Description Register a new user
 * Path: /register
 * Method: POST
 * Body:{name:string, email:string, password:string, confirm_password:string, date_of_birth:ISO08061}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController));

/**
 * Description. Logout a user
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body:{refresh_token: string}
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
);

/**
 * Description. Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body:{refresh_token: string}
 */
usersRouter.post(
  '/refresh-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
);

/**
 * Description. Verify email when user client click on the link email
 * Path: /verify-email
 * Method: POST
 * Body:{email_verify_token: string}
 */
usersRouter.post(
  '/verify-email',
  emailVerifyTokenValidator,
  wrapRequestHandler(verifyEmailController)
);

/**
 * Description. Verify email when user client click on the link email
 * Path: /resend-verify-email
 * Method: POST
 * Body:{}
 * Header: {Authorization: Bearer <access_token>}
 */
usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapRequestHandler(resendverifyEmailController)
);

/**
 * Description. Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body:{email:string}
 */
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
);

/**
 * Description. Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body:{forgot-password-token:string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
);

/**
 * Description. Reset Password
 * Path: /reset-password
 * Method: POST
 * Body:{forgot-password-token:string, password:string, confirm_password:string}
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
);

/**
 * Description. Get my profile
 * Path: /me
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * Description. Update my profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'date_of_birth',
    'cover_photo',
    'name',
    'website',
    'location',
    'username',
  ]),
  wrapRequestHandler(updateMeController)
);

/**
 * Description. Get user profile
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * Description. Follow someone
 * Path: /:username
 * Method: POST
 * Body: {follwed_user_id:string}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
);

/**
 * Description. Follow someone
 * Path: /follow/user_id
 * Method: DELETE
 * Header: {Authorization: Bearer<access_token>}
 * Body: {follwed_user_id:string}
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unFollowController)
);

/**
 * Description. Change Password
 * Path: /change-password
 * Method: DELETE
 * Header: {Authorization: Bearer<access_token>}
 * Body: {old_passowrd:string, password:string, confirm_password:string}
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
);

export default usersRouter;
