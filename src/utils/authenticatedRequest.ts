import { Request } from "express";
import { TUserType } from "../schema/userSchema";

interface AuthenticatedRequest extends Request {
  user?: TUserType;
}

export default AuthenticatedRequest;
