import Data from '../core/data';
import addEventsMethods from '../utils/events-methods';

let isAdded = Symbol('isAdded');

/**
 * Reactive storage of the entities.
 * Stores entities of the one type and provides events triggering
 * on any entity change.
 *
 * Example of usage:
 *
 * // Create user entity.
 * class User
 * {
 *    constructor(opts) {
 *        this.firstName = opts.firstName;
 *        this.secondName = opts.secondName;
 *        this.age = opts.age;
 *    }
 * }
 *
 * // Create storage of users.
 * let usersStorage = new Storage(User);
 *
 * // Create new user (entity of the storage).
 * let user = usersStorage.createEntity({firstName: 'John', secondName: 'Doe', age: 32});
 *
 * // Add user to the storage.
 * // From now any changes of the user will trigger 'change' event on the storage.
 * usersStorage.add(user);
 *
 * // Render some form to make changes of user.
 * UI('User form').render({model: user});
 */

export default class Storage extends Data
{
    constructor(entityClass, params) {
        if (params === undefined) {
            params = {};
        }
        super(params);

        this.throttle = params.throttle || 0;
        this.entityClass = entityClass;

        // Adds events support to the entity class.
        addEventsMethods(this.entityClass.prototype);

        this.entities = [];
    }

    /**
     * Adds entity to the storage.
     * @param entity {Object}
     * @param [triggerEvents] {boolean}
     * @return {boolean}
     */
    add(entity, triggerEvents) {
        if (!(entity instanceof this.entityClass)) {
            entity = this.createEntity(entity);
        }
        if (this.entities.indexOf(entity) < 0 && entity[isAdded] === false) {
            entity[isAdded] = true;
            this.entities.push(entity);

            if (triggerEvents !== false) {
                this.triggerEvent('add ~' + this.throttle, entity);
                this.triggerEvent('change ~' + this.throttle, entity);
            }

            return true;
        }
        return false;
    }

    /**
     * Adds few entities and returns quantity of successfully added entities.
     * @param entities {Array}
     * @param [triggerEvents] {boolean}
     * @return {Number}
     */
    addMultiple(entities, triggerEvents) {
        let k = 0;
        for (let i = 0; i < entities.length; i++) {
            if (this.add(entities[i], false)) k++;
        }

        if (triggerEvents !== false) {
            this.triggerEvent('add ~' + this.throttle, null);
            this.triggerEvent('change ~' + this.throttle, null);
        }

        return k;
    }

    /**
     * Removes entity from the storage.
     * @param entity
     * @param [triggerEvents] {boolean}
     * @return {boolean}
     */
    remove(entity, triggerEvents) {
        let index = this.entities.indexOf(entity);
        if (index >= 0) {
            entity[isAdded] = false;
            this.entities.splice(index, 1);

            if (triggerEvents !== false) {
                this.triggerEvent('remove', entity);
                this.triggerEvent('change ~' + this.throttle);
            }

            return true;
        }
        return false;
    }

    /**
     * Removes all entities from the storage.
     * Before they will be removed the 'isAdded' property will be set to false.
     * Also triggers 'change' event on the whole storage.
     * @param [triggerEvents] {boolean}
     * @return {Storage}
     */
    removeAll(triggerEvents) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i][isAdded] = false;
        }
        this.entities = [];

        if (triggerEvents !== false) {
            this.triggerEvent('change ~' + this.throttle);
        }

        return this;
    }

    /**
     * Returns quantity of the added entities.
     * @return {Number}
     * @see length
     */
    count() {
        return this.entities.length;
    }

    /**
     * Returns quantity of the added entities.
     * @return {Number}
     * @see count
     */
    length() {
        return this.entities.length;
    }

    /**
     * Creates new entity.
     * The new entity is not added to the storage.
     */
    createEntity(data) {
        let entity = new this.entityClass(data);

        let values = {};
        let storage = this;

        for (let p in entity) {
            if (entity.hasOwnProperty(p) && p !== isAdded) {

                values[p] = entity[p];
                delete entity[p];

                Object.defineProperty(entity, p, {
                    enumerable: true,
                    set: function(value){
                        values[p] = value;
                        if (!entity[isAdded]) return;
                        storage.triggerEvent('change ~' + storage.throttle, entity);
                    },
                    get: function () {
                        return values[p];
                    }
                });
            }
        }

        Object.defineProperty(entity, isAdded, {
            enumerable: false,
            set: function(value){
                values[isAdded] = value === true;
            },
            get: function () {
                return values[isAdded];
            }
        });

        entity[isAdded] = false;

        return entity;
    }

    /**
     * Few syntax sugar.
     * @param handler
     */
    set onChange(handler) {this.on('change', handler);}
    set onAdd(handler) {this.on('add', handler);}
    set onRemove(handler) {this.on('remove', handler);}
}

// Add events methods to the storage.
addEventsMethods(Storage.prototype);


Storage.isEntityAdded = function (entity) {
    return entity[isAdded] === true;
};

