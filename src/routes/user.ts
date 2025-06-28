import {Router} from "express"
import {updateUserProfile, uploadProfilePicture} from "../controllers/user"
import {ensureAuthenticated} from "../middleware/protected"

const router = Router();


router.post("/update",ensureAuthenticated,updateUserProfile);
router.post("/upload-picture", ensureAuthenticated, uploadProfilePicture);

export default router;
