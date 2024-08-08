import {Router} from 'express';
import { registerUser,loginUser, logoutUser, refreshAccessToken, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

//for user register
router.route("/register").post(
    upload.fields( [
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }

    ]),
    registerUser)


//secure route
//for user login
router.route("/login").post(loginUser)

//logout user
router.route("/logout").post(
    verifyJWT, 
    logoutUser
)

//refresh access token
router.route("/refresh-token").post(refreshAccessToken)

router.route("/update-avatar").post(
    upload.single("avatar"),
    verifyJWT,
    updateUserAvatar
)

router.route("/update-cover-image").post(
    upload.single("coverImage"),
    verifyJWT,
    updateUserCoverImage
)
export default router;