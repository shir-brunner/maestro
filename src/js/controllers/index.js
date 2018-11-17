module.exports.load = app => {
    app.controller('HomeController', require('./home.controller'));
};