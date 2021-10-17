import jwt from 'jsonwebtoken'

const extractUserId = async (req) => {
    const SECRET = process.env.SECRET_COOKIE_PASSWORD;
    const { authorization } = req.headers;
    const token = authorization.split(' ')[1];

    const userId = jwt.verify(token, SECRET);
    return userId;
};

export default extractUserId;