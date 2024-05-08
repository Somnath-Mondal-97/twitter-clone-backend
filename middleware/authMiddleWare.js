import { response } from 'express';
import JWT from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  console.log(req?.headers)
  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    const error = new Error("Authentication failed: Authorization header missing or invalid");
    res.status(404).send("Authentication failed: Authorization header missing or invalid")
    return next(error);
  }

  const token = authHeader?.split(" ")[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);

    req.body.user = {
      userId: userToken.userId,
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res.status(404).send("Authentication failed: Authorization header missing or invalid")
    next(error);
  }
};

export default userAuth;
