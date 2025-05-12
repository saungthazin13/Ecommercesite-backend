import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
} from "../../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/verifyOtp", verifyOtp);
router.post("/confirmPassword", confirmPassword);
router.post("/login", login);

export default router;
