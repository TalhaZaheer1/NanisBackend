import { Router } from "express"; 
import { ensureAuthenticated } from "../middleware/protected";
import { createConversation, getConversationMessages, streamResponse } from "../controllers/conversation";

const router = Router();


router.post("/",ensureAuthenticated,createConversation)
router.get("/messages/:id",getConversationMessages)
router.post("/generate",streamResponse);

export default router;
