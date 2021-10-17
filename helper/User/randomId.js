import { randomBytes } from 'crypto';

import User from '../../model/User.js';

export const getRandomId = async () => {
    const allUsers = (await User.find({})).map(user => user.image);

    let id = randomBytes(24).toString('hex');
    while ( allUsers.includes(id) ) {
        id = randomBytes(24).toString('hex');
    }
    
    return id;
}