module.exports.load = app => {
    app.factory('homeService', require('./home.service'));
};