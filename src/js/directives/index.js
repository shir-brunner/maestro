module.exports.load = app => {
    app.directive('timeline', require('./timeline.directive'));
};