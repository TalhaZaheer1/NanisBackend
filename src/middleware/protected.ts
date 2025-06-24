import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log({auth:req.isAuthenticated()});
  if (req.isAuthenticated && req.isAuthenticated()) {
     next();
      return;
  }
  res.status(401).json({ msg: "Unauthorized" });
  return;
};
