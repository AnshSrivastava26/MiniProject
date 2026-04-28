import express from "express";
import {
  getUserById,
  getUsers,
  setUserRole,
  syncUser,
} from "../controllers/users.js";

const userRouter = express.Router();

userRouter.post("/sync", syncUser);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.patch("/:id/role", setUserRole);

export default userRouter;
