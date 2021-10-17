const descriptiveUpdater = (title, value) => {
    let absoluteObject = null;
    switch ( title ) {
        case 'Username': 
            absoluteObject = {
                username: value
            }
            break;
        case 'Email': 
            absoluteObject = {
                email: value
            }
            break;
        case 'Address': 
            absoluteObject = {
                address: value
            }
            break;
        case 'Phone': 
            absoluteObject = {
                phone: value
            }
            break;
        case 'ZIP': 
            absoluteObject = {
                ZIP: value
            }
            break;
    }

    return absoluteObject;
}

export default descriptiveUpdater;