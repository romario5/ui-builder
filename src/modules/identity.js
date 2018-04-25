/**
 *       Identity module
 * ___________________________
 * ---------------------------
 *
 *
 * Identity is an object helper that stores information about user.
 * To set current user use [changeUser()] method:
 *
 * Identity.changeUser({
 *     firstName: 'John',
 *     secondName: 'Doe',
 *     email: 'john.doe@gmail.com',
 *     phone: '5165468548',
 *     photo: {
 *         small : '/url/to-the/small-photo.jpg',
 *         medium : '/url/to-the/medium-photo.jpg',
 *         large : '/url/to-the/large-photo.jpg'
 *     }
 * });
 *
 * To get user data use next syntax:
 * var name = Identity.getUser().getFullName();
 *
 * @constructor
 */


/**
 * Currently authorized used.
 * @type {null|User}
 */
var currentUser = null;


/**
 * Utility function|object helper.
 * Don't use this function to get current user because
 * behavior of this function may be changed in future.
 * Use Identity.getUser() instead.
 * @event changeUser - Occurred when current user changes.
 * @returns {null|User}
 */
function Identity()
{
    return currentUser;
}
/**
 * Add events support to the Identity object.
 */
addEventsImplementation.call(Identity);

/**
 * Returns true if user is guest.
 * @returns {boolean}
 */
Identity.isGuest = function () {
    return currentUser === null;
};

/**
 * Returns currently authorized user.
 * @returns {null}
 */
Identity.getUser = function () {
    return currentUser;
};

/**
 * User constructor.
 * @param userData
 * @constructor
 */
function User(userData)
{
    this.id = userData.id || null;
    this.firstName = userData.firstName || '';
    this.secondName = userData.secondName || '';
    this.email = userData.email || '';
    this.phone = userData.phone || '';
    this.photo = new Photo(userData.photo || {});

    this.sign = userData.sign || '';

    this.position = userData.position || '';
    this.companyId = userData.companyId || '';
    this.companyName = userData.companyName || '';
}

/**
 * Photo of the user.
 * Can be represented in three variants.
 *
 * Example:
 * photo = new Photo({
 *     small : '/url/to-the/small-photo.jpg',
 *     medium : '/url/to-the/medium-photo.jpg',
 *     large : '/url/to-the/large-photo.jpg'
 * });
 *
 * @param photoData
 * @constructor
 */
function Photo(photoData)
{
    this.small = photoData.small || '';
    this.medium = photoData.medium || '';
    this.large = photoData.large || '';
}

/**
 * Prototype of the User.
 * @type {{constructor: User, fullName: User.fullName}}
 */
User.prototype = {
    constructor: User,

    /**
     * Returns full name of the user.
     * @returns {string}
     */
    fullName : function () {
        return this.firstName + ' ' + this.secondName;
    }
};

/**
 *
 * @param userData
 */
Identity.changeUser = function(userData)
{
    var newUser = new User(userData);
    Identity.triggerEvent('changeUser', currentUser, newUser);
    currentUser = newUser;
};


_uibuilder.Identity = Identity;