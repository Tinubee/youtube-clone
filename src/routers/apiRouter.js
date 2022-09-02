import express from "express";
import {
  registerView,
  createComment,
  like,
  userSubscript,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post("/videos/:id([0-9a-f]{24})/like", like);
apiRouter.post("/user/:id([0-9a-f]{24})/subscript", userSubscript);
apiRouter.post(
  "/videos/:id([0-9a-f]{24})/deletecomment/:commentid([0-9a-f]{24})",
  deleteComment
);

export default apiRouter;
