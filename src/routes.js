module.exports = function routes($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            template: require('./js/partials/home.html'),
            controller: 'HomeController',
        });
};