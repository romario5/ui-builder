/**
 * The code name of the framework is JORA (Javascript Objects Recursive Aggregator).
 *
 * var data = new UIBuilder.DataAjax({url : '/index'});
 * var layout = UI('Main layout').renderTo('body').load(data);
 *
 * @author Roman Muravchuk <eas.roma@gmail.com>
 * @version 2.0.0
 * @date 15.11.2017
 */


var UIBuilder = (function () {


    // Add reset styles.
    (function(){
        var head  = document.getElementsByTagName('head')[0];
        var styleTag  = document.createElement('style');
        styleTag.innerHTML = '* {margin : 0; padding : 0; box-sizing: border-box;}';
        var comment = document.createComment('--- RESET ---');
        head.appendChild(comment);
        head.appendChild(styleTag);
    })();

