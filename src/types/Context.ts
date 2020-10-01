import { Request, Response } from "express";
import { User } from "src/entity/User";

export interface Context {
    req: Request & { session: { user: User }},
    res: Response
}