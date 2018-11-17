require('./css/main.scss');
require('angular-ui-router');
require('ng-ui-router-state-events');

const angular = require('angular');

const routes = require('./routes');
const controllers = require('./js/controllers');
const services = require('./js/services');
const components = require('./js/components');
const directives = require('./js/directives');
const config = require('./config');

const app = angular.module('app', ['ui.router', 'ui.router.state.events']);
app.config(routes);

controllers.load(app);
services.load(app);
components.load(app);
directives.load(app);

app.filter('capitalize', () => input => (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '');
app.constant('Config', config);
