import fs from 'fs';
import path from 'path';


const getImageFile = async (image) => {

    const relativePath = path.resolve();
    const imagePath = `${relativePath}\\uploads\\images\\profile\\${image}`;

    let imageFile = null;

    try {
        imageFile = fs.readFileSync(imagePath);
    } catch (e) {
        console.log(e);
    } finally {
        if ( !imageFile )
            return {};

        return imageFile;
    }
}

export default getImageFile;