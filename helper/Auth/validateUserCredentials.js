const validateUserCredentials = (username, password) => {
    const validity = {
        username: true,
        password: true,
    }
    if ( !username || username.length < 4 ) {
        validity.username = false;
    };
    if ( !password || password.length < 4 ) {
        validity.password = false;
    }

    return validity;
}

export default validateUserCredentials;