import jwt from 'jsonwebtoken';

const isAuthorized = (req, res, next) => {
    
    const authorization = req.headers.authorization || '';
    const token = authorization.split(' ')[1];

    let err = null;
    try {
        jwt.verify(token, process.env.SECRET_COOKIE_PASSWORD);
    } catch (e) {
        err = e
    } finally {
        if ( err )
            return res.status(401).send('Unauthorized!');
        else
            next();
    }
}

export default isAuthorized;