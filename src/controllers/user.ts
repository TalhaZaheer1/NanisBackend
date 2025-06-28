import { Request, Response } from "express";
import { userRepo } from "../config/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";

const updateUserProfile = async (req: Request, res: Response) => {
  const { name, preference, password } = req.body;
  try {
    const user = req.user as User;
    const hashed = await bcrypt.hash(password, 10);
    await userRepo.update(user.id, { name, preference, password: hashed });
    user.password = "";
    res.json({ msg: "Update Successful.", user });
  } catch (error) {
    res.status(500).json({ msg: "Update Failed." });
  }
};


const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { profilePic } = req.body;

    if (!profilePic) {
      res.status(400).json({ msg: "No image provided." });
      return;
    }

    await userRepo.update(user.id, { profilePic });

    res.json({ msg: "Profile picture updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to update profile picture." });
  }
};

export { updateUserProfile,uploadProfilePicture };
