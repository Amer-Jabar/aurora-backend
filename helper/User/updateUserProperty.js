const updateUserProperty = async (title, value) => {

    switch ( title ) {
        case 'Username':
            return ({
                username: value
            })
        case 'Password':
            return ({
                password: value
            })
        case 'Email':
            return ({
                email: value
            })
        case 'Image':
            return ({
                image: value
            })
        case 'Address':
            return ({
                address: value
            })
        case 'Phone':
            return ({
                phone: value
            })
        case 'ZIP':
            return ({
                ZIP: value
            })
    }
}

export default updateUserProperty;