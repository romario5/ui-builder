import Builder from './builder';
import Layout from './core/layout';
import Animation from './core/animation';
import Color from './utils/color';
import StyleGetter from './modules/theme/style-getter';
import {error, warn, log} from './utils/logging';
import {XY, Point, Vector, Rect} from './utils/geometry';
import themesManager from './modules/theme/theme';
import {setCsrfToken} from './modules/CSRF';
import Url from './modules/url';
import URL from './utils/url';
import RouteManager from './modules/router';
import L10n from './core/localization';
import Data from './core/data';
import GlobalEvents from './core/global-events';
import Ajax from './data-providers/ajax';
import {WSData, WS} from './data-providers/ws';
import Storage from './data-providers/storage';
import extensionManager from './core/extension';
import interfaceManager from './core/interface';
import Identity from './modules/identity';
import Format from './modules/format';
import registerThrottleEventExtension from './built-in/extensions/throttle-event.ext';
import registerPopoverExtension from './built-in/extensions/popover.ext';
import registerNumberFilterExtension from './built-in/extensions/number-filter.ext';
import registerDragExtension from './built-in/extensions/drag.ext';
import registerSortableExtension from './built-in/extensions/sortable.ext';
import registerTabExtension from './built-in/extensions/tab.ext';
import registerDropdownExtension from './built-in/extensions/dropdown.ext';
import registerLoadMoreExtension from './built-in/extensions/load-more.ext';
import registerActiveTriggerExtension from './built-in/extensions/active-trigger.ext';
import registerFormControlsInterfaces from './built-in/interfaces/form-contorls.int';
import registerComponentsInterfaces from './built-in/interfaces/components.int';
import registerHelpersInterfaces from './built-in/interfaces/helpers.int';
import registerModalUI from './built-in/ui/overlay/modal.ui';
import registerTabsUI from './built-in/ui/tabs/tabs.ui';
import registerDefaultTheme from './built-in/themes/default.theme';
import registerDarkTheme from './built-in/themes/dark.theme';
import registerLightTheme from './built-in/themes/light.theme';


// ===================== EXPORTED OBJECT =======================
// Add properties to the global object.

// Themes module.
Builder.error = error;
Builder.warn = warn;
Builder.log = log;
Builder.Theme = themesManager;
Builder.Extension = extensionManager;
Builder.L10n = L10n;
Builder.setLanguage = L10n.setLanguage;
Builder.getLanguage = L10n.getLanguage;
Builder.Identity = Identity;
Builder.Format = Format;
Builder.Interface = interfaceManager;
Builder.Data = Data;
Builder.Ajax = Ajax;
Builder.DataWS = WSData;
Builder.WSData = WSData;
Builder.WS = WS;
Builder.XY = XY;
Builder.Point = Point;
Builder.Vector = Vector;
Builder.Rect = Rect;
Builder.Storage = Storage;
Builder.setCsrfToken = setCsrfToken;
Builder.layout = Layout;
Builder.Url = Url;
Builder.Route = RouteManager;
Builder.GlobalEvents = GlobalEvents;
Builder.Animation = Animation;



// ===================== GLOBAL VARIABLES =======================
// Also export global variables.
// Feel free to edit this section as you want.
// If you need to use something with another alias - make changes here.

// Core.
window.UI        = Builder;
window.Extension = Builder.Extension;
window.L10n      = Builder.L10n;
window.Layout    = Builder.layout;
window.Interface = Builder.Interface;
window.Animation = Builder.Animation;
window.GlobalEvents = Builder.GlobalEvents;

// Misc
window.Animation = Builder.Animation;

// Data providers.
window.Data      = Builder.Data;
window.DataAjax  = Builder.Ajax;
window.Ajax      = Builder.Ajax;
window.DataWS    = Builder.DataWS;
window.WS        = Builder.WS;
window.Storage   = Builder.Storage;

// Themes support.
window.Color     = Color;
window.StyleGetter = StyleGetter;
window.Theme     = Builder.Theme;

// Geometry helpers.
window.Point     = Builder.Point;
window.Rect      = Builder.Rect;
window.Vector    = Builder.Vector;

// Modules.
window.Identity  = Builder.Identity;
window.Format    = Builder.Format;
window.Route     = Builder.Route;
window.Url       = Builder.Url;
window.URL       = URL;

// Store mouse position.
window.UI.mouseX = 0;
window.UI.mouseY = 0;

window.UI.isTabletScreen = function() {
    return window.innerWidth > 800 && window.innerWidth < 1024;
};

window.UI.isPhoneScreen = function() {
    return window.innerWidth > 240 && window.innerWidth < 640;
};

document.addEventListener('mousemove', function(e) {
    window.UI.mouseX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
    window.UI.mouseY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;
});


// ===================== BUILT-IN =======================
// To add some built-in - add them below.

// UI.
registerModalUI();
registerTabsUI();

// Themes
registerDarkTheme();
registerDefaultTheme();
registerLightTheme();

// Interfaces.
registerFormControlsInterfaces();
registerComponentsInterfaces();
registerHelpersInterfaces();

// Extensions.
registerActiveTriggerExtension();
registerThrottleEventExtension();
registerPopoverExtension();
registerNumberFilterExtension();
registerDragExtension();
registerSortableExtension();
registerTabExtension();
registerLoadMoreExtension();
registerDropdownExtension();

