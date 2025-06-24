import {Router} from "express"
import {updateUserProfile} from "../controllers/user"
import {ensureAuthenticated} from "../middleware/protected"

const router = Router();


router.post("/update",ensureAuthenticated,updateUserProfile);

export default router;
