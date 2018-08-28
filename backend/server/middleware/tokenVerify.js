import jwt from "jsonwebtoken";

// the secret is base64 encoded
const secret = Buffer.from(process.env.SECRET, "base64");

// will verify JWT token on req.body.token
// calls next() if valid token, otherwise respond with 400
export const tokenVerifyRoute = (req, res, next) => {
  const token = req.get("token");
  if (!token) return res.status(400).send("No token found!");
  try {
    req.decodedToken = jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(400).send("Invalid token!");
  }
};

// will verify JWT token on socket.handshake.query.token
// calls next() if valid token, otherwise close socket & send error
export const tokenVerifySocket = (socket, next) => {
  const { token } = socket.handshake.query;
  if (!token) return next(new Error("No token found!"));
  try {
    socket.decodedToken = jwt.verify(token, secret);
    next();
  } catch (err) {
    next(new Error("Invalid token!"));
  }
};

export const tokenVerifySimple = token => {
  return jwt.verify(token, secret);
};

