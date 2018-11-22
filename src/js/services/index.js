module.exports.load = app => {
    app.factory('audioService', require('./audio.service'));
};