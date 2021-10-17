import User from '../../model/User.js';
import extractUserId from './extractUserId.js';

const isOwner = async (req, res, next) => {

    const userId = (await extractUserId(req)).ownerId;
    const { productId } = req.params;
    
    const foundUser = await User.findById(userId);
    const isOwnerOfProduct = foundUser.solds.includes(productId);
    
    if ( isOwnerOfProduct )
        return next();
    else
        return res.status(403).send('User Is Not Owner Of Product!');

}

export default isOwner;