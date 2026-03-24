import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", verfifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verfifyJWT, changeCurrentPassword);
router.get("/current-user", verfifyJWT, getCurrentUser);

export default router;
