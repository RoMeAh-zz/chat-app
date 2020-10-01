import { Request, Response } from "express";
import { Redis } from "ioredis";
import { User } from "../entity/User";

export interface Context {
  req: Request & { session: { user: User } };
  res: Response;
  redis: Redis;
}
