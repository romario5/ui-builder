/**
 * Loader is used to partial loading of the source files.
 *
 * Example:
 *
 * UI.sources.setRootPath('/ui');
 * UI.sources.load('Main layout', 'layout/main');
 *
 *
 * If any specific loading logic used custom loader can be used.
 *
 * Example:
 *
 * UI.sources.setLoader((name, path) => {
 *     path += '.js';
 *     return new Promise((resolve, reject) => {
 *         UI.source.loadFile(path).then(() => {
 *             resolve();
 *             let ui = UI(name);
 *             if (ui !== null) {
 *                 ui.loadRequiredFiles();
 *             }
 *         });
 *     });
 * });
 *
 * @type {{}}
 */

let loadedFiles = {};


let loader = function(path) {

};