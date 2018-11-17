const Promise = require('bluebird');

module.exports = [function () {
    let imageService = {};

    imageService.loadImages = images => {
        return Promise.map(images, image => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.src = image;
                img.onload = () => resolve();
            });
        });
    };

    return imageService;
}];