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

const $ = require('jquery');
const $window = $(window).on('resize', onWindowResize);

function onWindowResize() {
    let windowWidth = $window.width();
    let windowHeight = $window.height();
    let scaleX = windowWidth / 1920;
    let scaleY = windowHeight / 970;

    $('.instrument-container').each(function () {
        fixPosition($(this), scaleX, scaleY);
    });

    fixPosition($('#controls'), scaleX, scaleY);
}

function fixPosition($element, scaleX, scaleY) {
    let originalX = $element.data('originalX');
    if(!originalX) {
        originalX = parseInt($element.css('left'));
        $element.data('originalX', originalX);
    }
    let originalY = $element.data('originalY');
    if(!originalY) {
        originalY = parseInt($element.css('top'));
        $element.data('originalY', originalY);
    }

    $element.css({
        'transform': `scale(${scaleX}, ${scaleY})`,
        'left': (originalX * scaleX) + 'px',
        'top': (originalY * scaleY) + 'px'
    });
}