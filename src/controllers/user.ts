import { Request, Response } from "express";
import { userRepo } from "../config/data-source";
import { User } from "../entities/User";

const updateUserProfile = async (req: Request, res: Response) => {
  const { name, preference } = req.body;
  try {
    const user = req.user as User;
    await userRepo.update(user.id, { name, preference });
    user.password = "";
    res.json({ msg: "Update Successful.", user });
  } catch (error) {
    res.status(500).json({ msg: "Update Failed." });
  }
};



export { updateUserProfile };
