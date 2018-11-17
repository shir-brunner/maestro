module.exports.load = app => {
    app.factory('audioService', require('./audio.service'));
    app.factory('imageService', require('./image.service'));
};