import {Router} from 'express';
import { registerUser,loginUser, logoutUser } from '../controllers/user.controller.js';
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

//for user login
router.route("/login").post(loginUser)

//logout user
router.route("/logout").post(
    verifyJWT, 
    logoutUser
)
export default router;