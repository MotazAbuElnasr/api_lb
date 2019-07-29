/**
* The `App` object represents a Loopback application.
*
* The App object extends [Express](http://expressjs.com/api.html#express) and
* supports Express middleware. See
* [Express documentation](http://expressjs.com/) for details.
*
* ```js
* var loopback = require('loopback');
* var app = loopback();
*
* app.get('/', function(req, res){
*   res.send('hello world');
* });
*
* app.listen(3000);
* ```
*
* @class LoopBackApplication
* @header var app = loopback()
*/

declare class LoopBackApplication {

      /**
      * Lazily load a set of [remote objects](http://apidocs.strongloop.com/strong-remoting/#remoteobjectsoptions).
      *
      * **NOTE:** Calling `app.remotes()` more than once returns only a single set of remote objects.
      * @returns {RemoteObjects}
      */

      remotes():RemoteObjects;

      /**
      * Attach a model to the app. The `Model` will be available on the
      * `app.models` object.
      *
      * Example - Attach an existing model:
      ```js
      * var User = loopback.User;
      * app.model(User);
      *```
      * Example - Attach an existing model, alter some aspects of the model:
      * ```js
      * var User = loopback.User;
      * app.model(User, { dataSource: 'db' });
      *```
      *
      * @param {Object} Model The model to attach.
      * @options {Object} config The model's configuration.
      * @property {String|DataSource} dataSource The `DataSource` to which to attach the model.
      * @property {Boolean} [public] Whether the model should be exposed via REST API.
      * @property {Object} [relations] Relations to add/update.
      * @end
      * @returns {ModelConstructor} the model class
      */

      model(Model: Object, config: {dataSource: String|DataSource, public?: Boolean, relations?: Object}):ModelConstructor;

      /**
      * Remove all references to a previously registered Model.
      *
      * The method emits "modelDeleted" event as a counter-part to "modelRemoted"
      * event.
      *
      * @param {String} modelName The name of the model to remove.
      */

      deleteModelByName(modelName: String):void;

      /**
      * Get the models exported by the app. Returns only models defined using `app.model()`
      *
      * There are two ways to access models:
      *
      * 1.  Call `app.models()` to get a list of all models.
      *
      * ```js
      * var models = app.models();
      *
      * models.forEach(function(Model) {
      *  console.log(Model.modelName); // color
      * });
      * ```
      *
      * 2. Use `app.models` to access a model by name.
      * `app.models` has properties for all defined models.
      *
      * The following example illustrates accessing the `Product` and `CustomerReceipt` models
      * using the `models` object.
      *
      * ```js
      * var loopback = require('loopback');
      *  var app = loopback();
      *  app.boot({
      *   dataSources: {
      *     db: {connector: 'memory'}
      *   }
      * });
      *
      * var productModel = app.registry.createModel('product');
      * app.model(productModel, {dataSource: 'db'});
      * var customerReceiptModel = app.registry.createModel('customer-receipt');
      * app.model(customerReceiptModel, {dataSource: 'db'});
      *
      * // available based on the given name
      * var Product = app.models.Product;
      *
      * // also available as camelCase
      * var product = app.models.product;
      *
      * // multi-word models are avaiable as pascal cased
      * var CustomerReceipt = app.models.CustomerReceipt;
      *
      * // also available as camelCase
      * var customerReceipt = app.models.customerReceipt;
      * ```
      *
      * @returns {Array} Array of model classes.
      */

      models():Array<any>;

      /**
      * Define a DataSource.
      *
      * @param {String} name The data source name
      * @param {Object} config The data source config
      */

      dataSource(name: String, config: Object):void;

      /**
      * Register a connector.
      *
      * When a new data-source is being added via `app.dataSource`, the connector
      * name is looked up in the registered connectors first.
      *
      * Connectors are required to be explicitly registered only for applications
      * using browserify, because browserify does not support dynamic require,
      * which is used by LoopBack to automatically load the connector module.
      *
      * @param {String} name Name of the connector, e.g. 'mysql'.
      * @param {Object} connector Connector object as returned
      *   by `require('loopback-connector-{name}')`.
      */

      connector(name: String, connector: Object):void;

      /**
      * Get all remote objects.
      * @returns {Object} [Remote objects](http://apidocs.strongloop.com/strong-remoting/#remoteobjectsoptions).
      */

      remoteObjects():Object;

      /**
      * An object to store dataSource instances.
      */

      dataSources():void;

      /**
      * Enable app wide authentication.
      */

      enableAuth():void;

      /**
      * Listen for connections and update the configured port.
      *
      * When there are no parameters or there is only one callback parameter,
      * the server will listen on `app.get('host')` and `app.get('port')`.
      *
      * For example, to listen on host/port configured in app config:
      * ```js
      * app.listen();
      * ```
      *
      * Otherwise all arguments are forwarded to `http.Server.listen`.
      *
      * For example, to listen on the specified port and all hosts, and ignore app config.
      * ```js
      * app.listen(80);
      * ```
      *
      * The function also installs a `listening` callback that calls
      * `app.set('port')` with the value returned by `server.address().port`.
      * This way the port param contains always the real port number, even when
      * listen was called with port number 0.
      *
      * @param {Function} [cb] If specified, the callback is added as a listener
      *   for the server's "listening" event.
      * @returns {http.Server} A node `http.Server` with this application configured
      *   as the request handler.
      */

      listen(cb?: Function):http.Server;

}

/**
* Register a middleware using a factory function and a JSON config.
*
* **Example**
*
* ```js
* app.middlewareFromConfig(compression, {
*   enabled: true,
*   phase: 'initial',
*   params: {
*     threshold: 128
*   }
* });
* ```
*
* @param {function} factory The factory function creating a middleware handler.
*   Typically a result of `require()` call, e.g. `require('compression')`.
* @options {Object} config The configuration.
* @property {String} phase The phase to register the middleware in.
* @property {Boolean} [enabled] Whether the middleware is enabled.
*   Default: `true`.
* @property {Array|*} [params] The arguments to pass to the factory
*   function. Either an array of arguments,
*   or the value of the first argument when the factory expects
*   a single argument only.
* @property {Array|string|RegExp} [paths] Optional list of paths limiting
*   the scope of the middleware.
*
* @returns {object} this (fluent API)
*
* @header app.middlewareFromConfig(factory, config)
*/

declare function middlewareFromConfig(factory: Function, config: {phase: String, enabled?: Boolean, params?: Array<any>|any, paths?: Array<any>|string|RegExp}):Object;

/**
* Register (new) middleware phases.
*
* If all names are new, then the phases are added just before "routes" phase.
* Otherwise the provided list of names is merged with the existing phases
* in such way that the order of phases is preserved.
*
* **Examples**
*
* ```js
* // built-in phases:
* // initial, session, auth, parse, routes, files, final
*
* app.defineMiddlewarePhases('custom');
* // new list of phases
* // initial, session, auth, parse, custom, routes, files, final
*
* app.defineMiddlewarePhases([
*   'initial', 'postinit', 'preauth', 'routes', 'subapps'
* ]);
* // new list of phases
* // initial, postinit, preauth, session, auth, parse, custom,
* // routes, subapps, files, final
* ```
*
* @param {string|Array.<string>} nameOrArray A phase name or a list of phase
*   names to add.
*
* @returns {object} this (fluent API)
*
* @header app.defineMiddlewarePhases(nameOrArray)
*/

declare function defineMiddlewarePhases(nameOrArray: string|Array<string>):Object;

/**
* Register a middleware handler to be executed in a given phase.
* @param {string} name The phase name, e.g. "init" or "routes".
* @param {Array|string|RegExp} [paths] Optional list of paths limiting
*   the scope of the middleware.
*   String paths are interpreted as expressjs path patterns,
*   regular expressions are used as-is.
* @param {function} handler The middleware handler, one of
*   `function(req, res, next)` or
*   `function(err, req, res, next)`
* @returns {object} this (fluent API)
*
* @header app.middleware(name, handler)
*/

declare function middleware(name: string, paths?: Array<any>|string|RegExp, handler: Function):Object;

/**
* LoopBack core module. It provides static properties and
* methods to create models and data sources. The module itself is a function
* that creates loopback `app`. For example:
*
* ```js
* var loopback = require('loopback');
* var app = loopback();
* ```
*
* @property {String} version Version of LoopBack framework.  Static read-only property.
* @property {Boolean} isBrowser True if running in a browser environment; false otherwise.  Static read-only property.
* @property {Boolean} isServer True if running in a server environment; false otherwise.  Static read-only property.
* @property {Registry} registry The global `Registry` object.
* @property {String} faviconFile Path to a default favicon shipped with LoopBack.
* Use as follows: `app.use(require('serve-favicon')(loopback.faviconFile));`
* @class loopback
* @header loopback
*/

declare function loopback():LoopBackApplication;

declare module 'loopback' {export = loopback;}

declare module loopback {

      /**
      * Add a remote method to a model.
      * @param {Function} fn
      * @param {Object} options (optional)
      */

      function remoteMethod(fn: Function, options: Object):void;

      /**
      * Create a template helper.
      *
      *     var render = loopback.template('foo.ejs');
      *     var html = render({foo: 'bar'});
      *
      * @param {String} file Path to the template file.
      * @returns {Function}
      */

      function template(file: String):Function;

      /**
      * Create a named vanilla JavaScript class constructor with an attached
      * set of properties and options.
      *
      * This function comes with two variants:
      *  * `loopback.createModel(name, properties, options)`
      *  * `loopback.createModel(config)`
      *
      * In the second variant, the parameters `name`, `properties` and `options`
      * are provided in the config object. Any additional config entries are
      * interpreted as `options`, i.e. the following two configs are identical:
      *
      * ```js
      * { name: 'Customer', base: 'User' }
      * { name: 'Customer', options: { base: 'User' } }
      * ```
      *
      * **Example**
      *
      * Create an `Author` model using the three-parameter variant:
      *
      * ```js
      * loopback.createModel(
      *   'Author',
      *   {
      *     firstName: 'string',
      *     lastName: 'string'
      *   },
      *   {
      *     relations: {
      *       books: {
      *         model: 'Book',
      *         type: 'hasAndBelongsToMany'
      *       }
      *     }
      *   }
      * );
      * ```
      *
      * Create the same model using a config object:
      *
      * ```js
      * loopback.createModel({
      *   name: 'Author',
      *   properties: {
      *     firstName: 'string',
      *     lastName: 'string'
      *   },
      *   relations: {
      *     books: {
      *       model: 'Book',
      *       type: 'hasAndBelongsToMany'
      *     }
      *   }
      * });
      * ```
      *
      * @param {String} name Unique name.
      * @param {Object} properties
      * @param {Object} options (optional)
      *
      * @header loopback.createModel
      */

      function createModel(name: String, properties: Object, options: Object):void;

      /**
      * Alter an existing Model class.
      * @param {Model} ModelCtor The model constructor to alter.
      * @options {Object} config Additional configuration to apply
      * @property {DataSource} dataSource Attach the model to a dataSource.
      * @property {Object} [relations] Model relations to add/update.
      *
      * @header loopback.configureModel(ModelCtor, config)
      */

      function configureModel(ModelCtor: Model, config: {dataSource: DataSource, relations?: Object}):void;

      /**
      * Look up a model class by name from all models created by
      * `loopback.createModel()`
      * @param {String} modelName The model name
      * @returns {Model} The model class
      *
      * @header loopback.findModel(modelName)
      */

      function findModel(modelName: String):Model;

      /**
      * Look up a model class by name from all models created by
      * `loopback.createModel()`. Throw an error when no such model exists.
      *
      * @param {String} modelName The model name
      * @returns {Model} The model class
      *
      * @header loopback.getModel(modelName)
      */

      function getModel(modelName: String):Model;

      /**
      * Look up a model class by the base model class.
      * The method can be used by LoopBack
      * to find configured models in models.json over the base model.
      * @param {Model} modelType The base model class
      * @returns {Model} The subclass if found or the base class
      *
      * @header loopback.getModelByType(modelType)
      */

      function getModelByType(modelType: Model):Model;

      /**
      * Create a data source with passing the provided options to the connector.
      *
      * @param {String} name Optional name.
      * @options {Object} options Data Source options
      * @property {Object} connector LoopBack connector.
      * @property {*} [*] Other&nbsp;connector properties.
      *   See the relevant connector documentation.
      */

      function createDataSource(name: String, options: {connector: Object, properties?: any}):void;

      /**
      * Get an in-memory data source. Use one if it already exists.
      *
      * @param {String} [name] The name of the data source.
      * If not provided, the `'default'` is used.
      */

      function memory(name?: String):void;

}

/**
* Define and reference `Models` and `DataSources`.
*
* @class
*/

declare class Registry {

      /**
      * Create a named vanilla JavaScript class constructor with an attached
      * set of properties and options.
      *
      * This function comes with two variants:
      *  * `loopback.createModel(name, properties, options)`
      *  * `loopback.createModel(config)`
      *
      * In the second variant, the parameters `name`, `properties` and `options`
      * are provided in the config object. Any additional config entries are
      * interpreted as `options`, i.e. the following two configs are identical:
      *
      * ```js
      * { name: 'Customer', base: 'User' }
      * { name: 'Customer', options: { base: 'User' } }
      * ```
      *
      * **Example**
      *
      * Create an `Author` model using the three-parameter variant:
      *
      * ```js
      * loopback.createModel(
      *   'Author',
      *   {
      *     firstName: 'string',
      *     lastName: 'string'
      *   },
      *   {
      *     relations: {
      *       books: {
      *         model: 'Book',
      *         type: 'hasAndBelongsToMany'
      *       }
      *     }
      *   }
      * );
      * ```
      *
      * Create the same model using a config object:
      *
      * ```js
      * loopback.createModel({
      *   name: 'Author',
      *   properties: {
      *     firstName: 'string',
      *     lastName: 'string'
      *   },
      *   relations: {
      *     books: {
      *       model: 'Book',
      *       type: 'hasAndBelongsToMany'
      *     }
      *   }
      * });
      * ```
      *
      * @param {String} name Unique name.
      * @param {Object} properties
      * @param {Object} options (optional)
      *
      * @header loopback.createModel
      */

      createModel(name: String, properties: Object, options: Object):void;

      /**
      * Alter an existing Model class.
      * @param {Model} ModelCtor The model constructor to alter.
      * @options {Object} config Additional configuration to apply
      * @property {DataSource} dataSource Attach the model to a dataSource.
      * @property {Object} [relations] Model relations to add/update.
      *
      * @header loopback.configureModel(ModelCtor, config)
      */

      configureModel(ModelCtor: Model, config: {dataSource: DataSource, relations?: Object}):void;

      /**
      * Look up a model class by name from all models created by
      * `loopback.createModel()`
      * @param {String|Function} modelOrName The model name or a `Model` constructor.
      * @returns {Model} The model class
      *
      * @header loopback.findModel(modelName)
      */

      findModel(modelOrName: String|Function):Model;

      /**
      * Look up a model class by name from all models created by
      * `loopback.createModel()`. **Throw an error when no such model exists.**
      *
      * @param {String} modelOrName The model name or a `Model` constructor.
      * @returns {Model} The model class
      *
      * @header loopback.getModel(modelName)
      */

      getModel(modelOrName: String):Model;

      /**
      * Look up a model class by the base model class.
      * The method can be used by LoopBack
      * to find configured models in models.json over the base model.
      * @param {Model} modelType The base model class
      * @returns {Model} The subclass if found or the base class
      *
      * @header loopback.getModelByType(modelType)
      */

      getModelByType(modelType: Model):Model;

      /**
      * Create a data source with passing the provided options to the connector.
      *
      * @param {String} name Optional name.
      * @options {Object} options Data Source options
      * @property {Object} connector LoopBack connector.
      * @property {*} [*] Other&nbsp;connector properties.
      *   See the relevant connector documentation.
      */

      createDataSource(name: String, options: {connector: Object, properties?: any}):void;

      /**
      * Get an in-memory data source. Use one if it already exists.
      *
      * @param {String} [name] The name of the data source.
      * If not provided, the `'default'` is used.
      */

      memory(name?: String):void;

}

/**
* Access context represents the context for a request to access protected
* resources
*
* NOTE While the method expects an array of principals in the AccessContext instance/object,
* it also accepts a single principal defined with the following properties:
* ```js
* {
*   // AccessContext instance/object
*   // ..
*   principalType: 'somePrincipalType', // APP, ROLE, USER, or custom user model name
*   principalId: 'somePrincipalId',
* }
* ```
*
* @class
* @options {AccessContext|Object} context An AccessContext instance or an object
* @property {Principal[]} principals An array of principals
* @property {Function} model The model class
* @property {String} modelName The model name
* @property {*} modelId The model id
* @property {String} property The model property/method/relation name
* @property {String} method The model method to be invoked
* @property {String} accessType The access type: READ, REPLICATE, WRITE, or EXECUTE.
* @property {AccessToken} accessToken The access token resolved for the request
* @property {RemotingContext} remotingContext The request's remoting context
* @property {Registry} registry The application or global registry
* @returns {AccessContext}
* @constructor
*/

declare class AccessContext {

      /**
      * Add a principal to the context
      * @param {String} principalType The principal type
      * @param {*} principalId The principal id
      * @param {String} [principalName] The principal name
      * @returns {boolean}
      */

      addPrincipal(principalType: String, principalId: any, principalName?: String):boolean;

      /**
      * Get the user id
      * @returns {*}
      */

      getUserId():any;

      /**
      * Get the user
      * @returns {*}
      */

      getUser():any;

      /**
      * Get the application id
      * @returns {*}
      */

      getAppId():any;

      /**
      * Check if the access context has authenticated principals
      * @returns {boolean}
      */

      isAuthenticated():boolean;

      /**
      * Get the list of scopes required by the current access context.
      */

      getScopes():void;

      /**
      * Check if the scope required by the remote method is allowed
      * by the scopes granted to the requesting access token.
      * @return {boolean}
      */

      isScopeAllowed():void;

      /**
      * This class represents the abstract notion of a principal, which can be used
      * to represent any entity, such as an individual, a corporation, and a login id
      * @param {String} type The principal type
      * @param {*} id The principal id
      * @param {String} [name] The principal name
      * @param {String} modelName The principal model name
      * @returns {Principal}
      * @class
      */

}

      declare class Principal {

      /**
      * Compare if two principals are equal
      * Returns true if argument principal is equal to this principal.
      * @param {Object} p The other principal
      */

      equals(p: Object):void;

      /**
      * A request to access protected resources.
      *
      * The method can either be called with the following signature or with a single
      * argument: an AccessRequest instance or an object containing all the required properties.
      *
      * @class
      * @options {String|AccessRequest|Object} model|req The model name,<br>
      *    or an AccessRequest instance/object.
      * @param {String} property The property/method/relation name
      * @param {String} accessType The access type
      * @param {String} permission The requested permission
      * @param {String[]} methodNames The names of involved methods
      * @param {Registry} registry The application or global registry
      * @returns {AccessRequest}
      */

}

      declare class AccessRequest {

      /**
      * Does the request contain any wildcards?
      *
      * @returns {Boolean}
      */

      isWildcard():Boolean;

      /**
      * Does the given `ACL` apply to this `AccessRequest`.
      *
      * @param {ACL} acl
      */

      exactlyMatches(acl: ACL):void;

      /**
      * Settle the accessRequest's permission if DEFAULT
      * In most situations, the default permission can be resolved from the nested model
      * config. An default permission can also be explicitly provided to override it or
      * cope with AccessRequest instances without a nested model (e.g. model is '*')
      *
      * @param {String} defaultPermission (optional) the default permission to apply
      */

      settleDefaultPermission(defaultPermission: String):void;

      /**
      * Is the request for access allowed?
      *
      * @returns {Boolean}
      */

      isAllowed():Boolean;

}

/**
* The base class for **all models**.
*
* **Inheriting from `Model`**
*
* ```js
* var properties = {...};
* var options = {...};
* var MyModel = loopback.Model.extend('MyModel', properties, options);
* ```
*
* **Options**
*
*  - `trackChanges` - If true, changes to the model will be tracked. **Required
* for replication.**
*
* **Events**
*
* #### Event: `changed`
*
* Emitted after a model has been successfully created, saved, or updated.
* Argument: `inst`, model instance, object
*
* ```js
* MyModel.on('changed', function(inst) {
*   console.log('model with id %s has been changed', inst.id);
*   // => model with id 1 has been changed
* });
* ```
*
* #### Event: `deleted`
*
* Emitted after an individual model has been deleted.
* Argument: `id`, model ID (number).
*
* ```js
* MyModel.on('deleted', function(id) {
*   console.log('model with id %s has been deleted', id);
*   // => model with id 1 has been deleted
* });
* ```
*
* #### Event: `deletedAll`
*
* Emitted after all models have been deleted.
* Argument: `where` (optional), where filter, JSON object.
*
* ```js
* MyModel.on('deletedAll', function(where) {
*   if (where) {
*     console.log('all models where ', where, ' have been deleted');
*     // => all models where
*     // => {price: {gt: 100}}
*     // => have been deleted
*   }
* });
* ```
*
* #### Event: `attached`
*
* Emitted after a `Model` has been attached to an `app`.
*
* #### Event: `dataSourceAttached`
*
* Emitted after a `Model` has been attached to a `DataSource`.
*
* #### Event: set
*
* Emitted when model property is set.
* Argument: `inst`, model instance, object
*
* ```js
* MyModel.on('set', function(inst) {
*   console.log('model with id %s has been changed', inst.id);
*   // => model with id 1 has been changed
* });
* ```
*
* @param {Object} data
* @property {String} Model.modelName The name of the model. Static property.
* @property {DataSource} Model.dataSource Data source to which the model is connected, if any. Static property.
* @property {SharedClass} Model.sharedMethod The `strong-remoting` [SharedClass](http://apidocs.strongloop.com/strong-remoting/#sharedclass) that contains remoting (and http) metadata. Static property.
* @property {Object} settings Contains additional model settings.
* @property {string} settings.http.path Base URL of the model HTTP route.
* @property {Array.<Object>} settings.acls Array of ACLs for the model.
* @class
*/

declare class Model {

      /**
      * The `loopback.Model.extend()` method calls this when you create a model that extends another model.
      * Add any setup or configuration code you want executed when the model is created.
      * See  [Setting up a custom model](http://loopback.io/doc/en/lb2/Extending-built-in-models.html#setting-up-a-custom-model).
      */

      setup():void;

      /**
      * Check if the given access token can invoke the specified method.
      *
      * @param {AccessToken} token The access token.
      * @param {*} modelId The model ID.
      * @param {SharedMethod} sharedMethod The method in question.
      * @param {Object} ctx The remote invocation context.
      * @callback {Function} callback The callback function.
      * @param {String|Error} err The error object.
      * @param {Boolean} allowed True if the request is allowed; false otherwise.
      */

      checkAccess(token: AccessToken, modelId: any, sharedMethod: SharedMethod, ctx: Object, callback: (err: String|Error, allowed: Boolean) => void):void;

      /**
      * Get the `Application` object to which the Model is attached.
      *
      * @callback {Function} callback Callback function called with `(err, app)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Application} app Attached application object.
      * @end
      */

      getApp(callback: (err: Error, app: Application) => void):void;

      /**
      * Enable remote invocation for the specified method.
      * See [Remote methods](http://loopback.io/doc/en/lb2/Remote-methods.html) for more information.
      *
      * Static method example:
      * ```js
      * Model.myMethod();
      * Model.remoteMethod('myMethod');
      * ```
      *
      * @param {String} name The name of the method.
      * @param {Object} options The remoting options.
      * See [Remote methods - Options](http://loopback.io/doc/en/lb2/Remote-methods.html#options).
      */

      remoteMethod(name: String, options: Object):void;

      /**
      * Configure default values for juggler settings to protect user-supplied
      * input from attacking juggler
      */

      DEFAULT_OPTIONS():void;

      /**
      * Disable remote invocation for the method with the given name.
      *
      * @param {String} name The name of the method.
      * @param {Boolean} isStatic Is the method static (eg. `MyModel.myMethod`)? Pass
      * `false` if the method defined on the prototype (eg.
      * `MyModel.prototype.myMethod`).
      */

      disableRemoteMethod(name: String, isStatic: Boolean):void;

      /**
      * Disable remote invocation for the method with the given name.
      *
      * @param {String} name The name of the method (include "prototype." if the method is defined on the prototype).
      *
      */

      disableRemoteMethodByName(name: String):void;

      /**
      * Enabled deeply-nested queries of related models via REST API.
      *
      * @param {String} relationName Name of the nested relation.
      * @options {Object} [options] It is optional. See below.
      * @param {String} pathName The HTTP path (relative to the model) at which your remote method is exposed.
      * @param {String} filterMethod The filter name.
      * @param {String} paramName The argument name that the remote method accepts.
      * @param {String} getterName The getter name.
      * @param {Boolean} hooks Whether to inherit before/after hooks.
      * @callback {Function} filterCallback The Optional filter function.
      * @param {Object} SharedMethod object. See [here](https://apidocs.strongloop.com/strong-remoting/#sharedmethod).
      * @param {Object} RelationDefinition object which includes relation `type`, `ModelConstructor` of `modelFrom`, `modelTo`, `keyFrom`, `keyTo` and more relation definitions.
      */

      nestRemoting(relationName: String, pathName: String, filterMethod: String, paramName: String, getterName: String, hooks: Boolean, options?: {}, filterCallback: (SharedMethod: Object, RelationDefinition: Object) => void):void;

      /**
      * Create "options" value to use when invoking model methods
      * via strong-remoting (e.g. REST).
      *
      * Example
      *
      * ```js
      * MyModel.myMethod = function(options, cb) {
      *   // by default, options contains only one property "accessToken"
      *   var accessToken = options && options.accessToken;
      *   var userId = accessToken && accessToken.userId;
      *   var message = 'Hello ' + (userId ? 'user #' + userId : 'anonymous');
      *   cb(null, message);
      * });
      *
      * MyModel.remoteMethod('myMethod', {
      *   accepts: {
      *     arg: 'options',
      *     type: 'object',
      *     // "optionsFromRequest" is a loopback-specific HTTP mapping that
      *     // calls Model's createOptionsFromRemotingContext
      *     // to build the argument value
      *     http: 'optionsFromRequest'
      *    },
      *    returns: {
      *      arg: 'message',
      *      type: 'string'
      *    }
      * });
      * ```
      *
      * @param {Object} ctx A strong-remoting Context instance
      * @returns {Object} The value to pass to "options" argument.
      */

      createOptionsFromRemotingContext(ctx: Object):Object;

}

/**
* Extends Model with basic query and CRUD support.
*
* **Change Event**
*
* Listen for model changes using the `change` event.
*
* ```js
* MyPersistedModel.on('changed', function(obj) {
*    console.log(obj) // => the changed model
* });
* ```
*
* @class PersistedModel
*/

declare class PersistedModel {

      /**
      * Create new instance of Model, and save to database.
      *
      * @param {Object|Object[]} [data] Optional data argument.  Can be either a single model instance or an array of instances.
      *
      * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} models Model instances or null.
      */

      create(data?: Object|Object[], callback: (err: Error, models: Object) => void):void;

      /**
      * Update or insert a model instance
      * @param {Object} data The model instance data to insert.
      * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} model Updated model instance.
      */

      upsert(data: Object, callback: (err: Error, model: Object) => void):void;

      /**
      * Update or insert a model instance based on the search criteria.
      * If there is a single instance retrieved, update the retrieved model.
      * Creates a new model if no model instances were found.
      * Returns an error if multiple instances are found.
      * @param {Object} [where]  `where` filter, like
      * ```
      * { key: val, key2: {gt: 'val2'}, ...}
      * ```
      * <br/>see
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
      * @param {Object} data The model instance data to insert.
      * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} model Updated model instance.
      */

      upsertWithWhere(where?: Object, data: Object, callback: (err: Error, model: Object) => void):void;

      /**
      * Replace or insert a model instance; replace existing record if one is found,
      * such that parameter `data.id` matches `id` of model instance; otherwise,
      * insert a new record.
      * @param {Object} data The model instance data.
      * @options {Object} [options] Options for replaceOrCreate
      * @property {Boolean} validate Perform validation before saving.  Default is true.
      * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} model Replaced model instance.
      */

      replaceOrCreate(data: Object, options?: {validate: Boolean}, callback: (err: Error, model: Object) => void):void;

      /**
      * Finds one record matching the optional filter object. If not found, creates
      * the object using the data provided as second argument. In this sense it is
      * the same as `find`, but limited to one object. Returns an object, not
      * collection. If you don't provide the filter object argument, it tries to
      * locate an existing object that matches the `data` argument.
      *
      * @options {Object} [filter] Optional Filter object; see below.
      * @property {String|Object|Array} fields Identify fields to include in return result.
      * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
      * @property {String|Object|Array} include  See PersistedModel.include documentation.
      * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
      * @property {Number} limit Maximum number of instances to return.
      * <br/>See [Limit filter](http://loopback.io/doc/en/lb2/Limit-filter.html).
      * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
      * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
      * @property {Number} skip Number of results to skip.
      * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
      * @property {Object} where Where clause, like
      * ```
      * {where: {key: val, key2: {gt: val2}, ...}}
      * ```
      * <br/>See
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
      * @param {Object} data Data to insert if object matching the `where` filter is not found.
      * @callback {Function} callback Callback function called with `cb(err, instance, created)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Model instance matching the `where` filter, if found.
      * @param {Boolean} created True if the instance does not exist and gets created.
      */

      findOrCreate(data: Object, filter?: {fields: String|Object|Array<any>, include: String|Object|Array<any>, limit: Number, order: String, skip: Number, where: Object}, callback: (err: Error, instance: Object, created: Boolean) => void):void;

      /**
      * Check whether a model instance exists in database.
      *
      * @param {id} id Identifier of object (primary key value).
      *
      * @callback {Function} callback Callback function called with `(err, exists)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Boolean} exists True if the instance with the specified ID exists; false otherwise.
      */

      exists(id: id, callback: (err: Error, exists: Boolean) => void):void;

      /**
      * Find object by ID with an optional filter for include/fields.
      *
      * @param {*} id Primary key value
      * @options {Object} [filter] Optional Filter JSON object; see below.
      * @property {String|Object|Array} fields Identify fields to include in return result.
      * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
      * @property {String|Object|Array} include  See PersistedModel.include documentation.
      * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Model instance matching the specified ID or null if no instance matches.
      */

      findById(id: any, filter?: {fields: String|Object|Array<any>, include: String|Object|Array<any>}, callback: (err: Error, instance: Object) => void):void;

      /**
      * Find all model instances that match `filter` specification.
      * See [Querying models](http://loopback.io/doc/en/lb2/Querying-data.html).
      *
      * @options {Object} [filter] Optional Filter JSON object; see below.
      * @property {String|Object|Array} fields Identify fields to include in return result.
      * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
      * @property {String|Object|Array} include  See PersistedModel.include documentation.
      * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
      * @property {Number} limit Maximum number of instances to return.
      * <br/>See [Limit filter](http://loopback.io/doc/en/lb2/Limit-filter.html).
      * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
      * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
      * @property {Number} skip Number of results to skip.
      * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
      * @property {Object} where Where clause, like
      * ```
      * { where: { key: val, key2: {gt: 'val2'}, ...} }
      * ```
      * <br/>See
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
      *
      * @callback {Function} callback Callback function called with `(err, returned-instances)` arguments.    Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Array} models Model instances matching the filter, or null if none found.
      */

      find(filter?: {fields: String|Object|Array<any>, include: String|Object|Array<any>, limit: Number, order: String, skip: Number, where: Object}, callback: (err: Error, models: Array<any>) => void):void;

      /**
      * Find one model instance that matches `filter` specification.
      * Same as `find`, but limited to one result;
      * Returns object, not collection.
      *
      * @options {Object} [filter] Optional Filter JSON object; see below.
      * @property {String|Object|Array} fields Identify fields to include in return result.
      * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
      * @property {String|Object|Array} include  See PersistedModel.include documentation.
      * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
      * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
      * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
      * @property {Number} skip Number of results to skip.
      * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
      * @property {Object} where Where clause, like
      * ```
      * {where: { key: val, key2: {gt: 'val2'}, ...} }
      * ```
      * <br/>See
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
      *
      * @callback {Function} callback Callback function called with `(err, returned-instance)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Array} model First model instance that matches the filter or null if none found.
      */

      findOne(filter?: {fields: String|Object|Array<any>, include: String|Object|Array<any>, order: String, skip: Number, where: Object}, callback: (err: Error, model: Array<any>) => void):void;

      /**
      * Destroy all model instances that match the optional `where` specification.
      *
      * @param {Object} [where] Optional where filter, like:
      * ```
      * {key: val, key2: {gt: 'val2'}, ...}
      * ```
      * <br/>See
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
      *
      * @callback {Function} callback Optional callback function called with `(err, info)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} info Additional information about the command outcome.
      * @param {Number} info.count Number of instances (rows, documents) destroyed.
      */

      destroyAll(where?: Object, callback: (err: Error, info: Object, infoCount: Number) => void):void;

      /**
      * Alias for `destroyAll`
      */

      remove():void;

      /**
      * Alias for `destroyAll`
      */

      deleteAll():void;

      /**
      * Update multiple instances that match the where clause.
      *
      * Example:
      *
      *```js
      * Employee.updateAll({managerId: 'x001'}, {managerId: 'x002'}, function(err, info) {
      *     ...
      * });
      * ```
      *
      * @param {Object} [where] Optional `where` filter, like
      * ```
      * { key: val, key2: {gt: 'val2'}, ...}
      * ```
      * <br/>see
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
      * @param {Object} data Object containing data to replace matching instances, if any.
      *
      * @callback {Function} callback Callback function called with `(err, info)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} info Additional information about the command outcome.
      * @param {Number} info.count Number of instances (rows, documents) updated.
      *
      */

      updateAll(where?: Object, data: Object, callback: (err: Error, info: Object, infoCount: Number) => void):void;

      /**
      * Alias for updateAll.
      */

      update():void;

      /**
      * Destroy model instance with the specified ID.
      * @param {*} id The ID value of model instance to delete.
      * @callback {Function} callback Callback function called with `(err)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      */

      destroyById(id: any, callback: (err: Error) => void):void;

      /**
      * Alias for destroyById.
      */

      removeById():void;

      /**
      * Alias for destroyById.
      */

      deleteById():void;

      /**
      * Return the number of records that match the optional "where" filter.
      * @param {Object} [where] Optional where filter, like
      * ```
      * { key: val, key2: {gt: 'val2'}, ...}
      * ```
      * <br/>See
      * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
      * @callback {Function} callback Callback function called with `(err, count)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Number} count Number of instances.
      */

      count(where?: Object, callback: (err: Error, count: Number) => void):void;

      /**
      * Save model instance. If the instance doesn't have an ID, then calls [create](#persistedmodelcreatedata-cb) instead.
      * Triggers: validate, save, update, or create.
      * @options {Object} [options] See below.
      * @property {Boolean} validate Perform validation before saving.  Default is true.
      * @property {Boolean} throws If true, throw a validation error; WARNING: This can crash Node.
      * If false, report the error via callback.  Default is false.
      * @callback {Function} callback Optional callback function called with `(err, obj)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Model instance saved or created.
      */

      save(options?: {validate: Boolean, throws: Boolean}, callback: (err: Error, instance: Object) => void):void;

      /**
      * Determine if the data model is new.
      * @returns {Boolean} Returns true if the data model is new; false otherwise.
      */

      isNewRecord():Boolean;

      /**
      * Deletes the model from persistence.
      * Triggers `destroy` hook (async) before and after destroying object.
      * @param {Function} callback Callback function.
      */

      destroy(callback: Function):void;

      /**
      * Alias for destroy.
      * @header PersistedModel.remove
      */

      remove():void;

      /**
      * Alias for destroy.
      * @header PersistedModel.delete
      */

      delete():void;

      /**
      * Update a single attribute.
      * Equivalent to `updateAttributes({name: 'value'}, cb)`
      *
      * @param {String} name Name of property.
      * @param {Mixed} value Value of property.
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Updated instance.
      */

      updateAttribute(name: String, value: Mixed, callback: (err: Error, instance: Object) => void):void;

      /**
      * Update set of attributes.  Performs validation before updating.
      *
      * Triggers: `validation`, `save` and `update` hooks
      * @param {Object} data Data to update.
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Updated instance.
      */

      updateAttributes(data: Object, callback: (err: Error, instance: Object) => void):void;

      /**
      * Replace attributes for a model instance and persist it into the datasource.
      * Performs validation before replacing.
      *
      * @param {Object} data Data to replace.
      * @options {Object} [options] Options for replace
      * @property {Boolean} validate Perform validation before saving.  Default is true.
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Replaced instance.
      */

      replaceAttributes(data: Object, options?: {validate: Boolean}, callback: (err: Error, instance: Object) => void):void;

      /**
      * Replace attributes for a model instance whose id is the first input
      * argument and persist it into the datasource.
      * Performs validation before replacing.
      *
      * @param {*} id The ID value of model instance to replace.
      * @param {Object} data Data to replace.
      * @options {Object} [options] Options for replace
      * @property {Boolean} validate Perform validation before saving.  Default is true.
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Replaced instance.
      */

      replaceById(id: any, data: Object, options?: {validate: Boolean}, callback: (err: Error, instance: Object) => void):void;

      /**
      * Reload object from persistence.  Requires `id` member of `object` to be able to call `find`.
      * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} instance Model instance.
      */

      reload(callback: (err: Error, instance: Object) => void):void;

      /**
      * Set the correct `id` property for the `PersistedModel`. Uses the `setId` method if the model is attached to
      * connector that defines it.  Otherwise, uses the default lookup.
      * Override this method to handle complex IDs.
      *
      * @param {*} val The `id` value. Will be converted to the type that the `id` property specifies.
      */

      setId(val: any):void;

      /**
      * Get the `id` value for the `PersistedModel`.
      *
      * @returns {*} The `id` value
      */

      getId():any;

      /**
      * Get the `id` property name of the constructor.
      *
      * @returns {String} The `id` property name
      */

      getIdName():String;

      /**
      * Get the `id` property name of the constructor.
      *
      * @returns {String} The `id` property name
      */

      getIdName():String;

      /**
      * Get a set of deltas and conflicts since the given checkpoint.
      *
      * See [Change.diff()](#change-diff) for details.
      *
      * @param  {Number}  since  Find deltas since this checkpoint.
      * @param  {Array}  remoteChanges  An array of change objects.
      * @callback {Function} callback Callback function called with `(err, result)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Object} result Object with `deltas` and `conflicts` properties; see [Change.diff()](#change-diff) for details.
      */

      diff(since: Number, remoteChanges: Array<any>, callback: (err: Error, result: Object) => void):void;

      /**
      * Get the changes to a model since the specified checkpoint. Provide a filter object
      * to reduce the number of results returned.
      * @param  {Number}   since    Return only changes since this checkpoint.
      * @param  {Object}   filter   Include only changes that match this filter, the same as for [#persistedmodel-find](find()).
      * @callback {Function} callback Callback function called with `(err, changes)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Array} changes An array of [Change](#change) objects.
      */

      changes(since: Number, filter: Object, callback: (err: Error, changes: Array<any>) => void):void;

      /**
      * Create a checkpoint.
      *
      * @param  {Function} callback
      */

      checkpoint(callback: Function):void;

      /**
      * Get the current checkpoint ID.
      *
      * @callback {Function} callback Callback function called with `(err, currentCheckpointId)` arguments.  Required.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Number} currentCheckpointId Current checkpoint ID.
      */

      currentCheckpoint(callback: (err: Error, currentCheckpointId: Number) => void):void;

      /**
      * Replicate changes since the given checkpoint to the given target model.
      *
      * @param  {Number}   [since]  Since this checkpoint
      * @param  {Model}    targetModel  Target this model class
      * @param  {Object} [options] An optional options object to pass to underlying data-access calls.
      * @param {Object} [options.filter] Replicate models that match this filter
      * @callback {Function} [callback] Callback function called with `(err, conflicts)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {Conflict[]} conflicts A list of changes that could not be replicated due to conflicts.
      * @param {Object} checkpoints The new checkpoints to use as the "since"
      * argument for the next replication.
      *
      * @promise
      */

      replicate(since?: Number, targetModel: Model, options?: Object, optionsFilter?: Object, callback?: (err: Error, conflicts: Conflict[], checkpoints: Object) => void):void;

      /**
      * Create an update list (for `Model.bulkUpdate()`) from a delta list
      * (result of `Change.diff()`).
      *
      * @param  {Array}    deltas
      * @param  {Function} callback
      */

      createUpdates(deltas: Array<any>, callback: Function):void;

      /**
      * Apply an update list.
      *
      * **Note: this is not atomic**
      *
      * @param  {Array} updates An updates list, usually from [createUpdates()](#persistedmodel-createupdates).
      * @param  {Object} [options] An optional options object to pass to underlying data-access calls.
      * @param  {Function} callback Callback function.
      */

      bulkUpdate(updates: Array<any>, options?: Object, callback: Function):void;

      /**
      * Get the `Change` model.
      * Throws an error if the change model is not correctly setup.
      * @return {Change}
      */

      getChangeModel():void;

      /**
      * Get the source identifier for this model or dataSource.
      *
      * @callback {Function} callback Callback function called with `(err, id)` arguments.
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      * @param {String} sourceId Source identifier for the model or dataSource.
      */

      getSourceId(callback: (err: Error, sourceId: String) => void):void;

      /**
      * Enable the tracking of changes made to the model. Usually for replication.
      */

      enableChangeTracking():void;

      /**
      * Handle a change error. Override this method in a subclassing model to customize
      * change error handling.
      *
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
      */

      handleChangeError(err: Error):void;

      /**
      * Specify that a change to the model with the given ID has occurred.
      *
      * @param {*} id The ID of the model that has changed.
      * @callback {Function} callback
      * @param {Error} err
      */

      rectifyChange(id: any, callback: (err: Error) => void):void;

      /**
      * Create a change stream. [See here for more info](http://loopback.io/doc/en/lb2/Realtime-server-sent-events.html)
      *
      * @param {Object} options
      * @param {Object} options.where Only changes to models matching this where filter will be included in the `ChangeStream`.
      * @callback {Function} callback
      * @param {Error} err
      * @param {ChangeStream} changes
      */

      createChangeStream(options: Object, optionsWhere: Object, callback: (err: Error, changes: ChangeStream) => void):void;

      /**
      * Get the filter for searching related changes.
      *
      * Models should override this function to copy properties
      * from the model instance filter into the change search filter.
      *
      * ```js
      * module.exports = (TargetModel, config) => {
      *   TargetModel.createChangeFilter = function(since, modelFilter) {
      *     const filter = this.base.createChangeFilter.apply(this, arguments);
      *     if (modelFilter && modelFilter.where && modelFilter.where.tenantId) {
      *       filter.where.tenantId = modelFilter.where.tenantId;
      *     }
      *     return filter;
      *   };
      * };
      * ```
      *
      * @param {Number} since Return only changes since this checkpoint.
      * @param {Object} modelFilter Filter describing which model instances to
      * include in the list of changes.
      * @returns {Object} The filter object to pass to `Change.find()`. Default:
      * ```
      * {where: {checkpoint: {gte: since}, modelName: this.modelName}}
      * ```
      */

      createChangeFilter(since: Number, modelFilter: Object):Object;

      /**
      * Add custom data to the Change instance.
      *
      * Models should override this function to duplicate model instance properties
      * to the Change instance properties, typically to allow the changes() method
      * to filter the changes using these duplicated properties directly while
      * querying the Change model.
      *
      * ```js
      * module.exports = (TargetModel, config) => {
      *   TargetModel.prototype.fillCustomChangeProperties = function(change, cb) {
      *     var inst = this;
      *     const base = this.constructor.base;
      *     base.prototype.fillCustomChangeProperties.call(this, change, err => {
      *       if (err) return cb(err);
      *
      *       if (inst && inst.tenantId) {
      *         change.tenantId = inst.tenantId;
      *       } else {
      *         change.tenantId = null;
      *       }
      *
      *       cb();
      *     });
      *   };
      * };
      * ```
      *
      * @callback {Function} callback
      * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb3/Error-object.html).
      */

      fillCustomChangeProperties(callback: (err: Error) => void):void;

}

/**
* Serve the LoopBack favicon.
* @header loopback.favicon()
*/

declare function exports():void;

/**
* Expose models over REST.
*
* For example:
* ```js
* app.use(loopback.rest());
* ```
* For more information, see [Exposing models over a REST API](http://loopback.io/doc/en/lb2/Exposing-models-over-REST.html).
* @header loopback.rest()
*/

declare function rest():void;

/**
* Serve static assets of a LoopBack application.
*
* @param {string} root The root directory from which the static assets are to
* be served.
* @param {object} options Refer to
*   [express documentation](http://expressjs.com/4x/api.html#express.static)
*   for the full list of available options.
* @header loopback.static(root, [options])
*/

declare function 'use strict';(root: string, options: Object):void;

/**
* Return [HTTP response](http://expressjs.com/4x/api.html#res.send) with basic application status information:
* date the application was started and uptime, in JSON format.
* For example:
* ```js
* {
*  "started": "2014-06-05T00:26:49.750Z",
*  "uptime": 9.394
* }
* ```
*
* @header loopback.status()
*/

declare function status():void;

/**
* Check for an access token in cookies, headers, and query string parameters.
* This function always checks for the following:
*
* - `access_token` (params only)
* - `X-Access-Token` (headers only)
* - `authorization` (headers and cookies)
*
* It checks for these values in cookies, headers, and query string parameters _in addition_ to the items
* specified in the options parameter.
*
* **NOTE:** This function only checks for [signed cookies](http://expressjs.com/api.html#req.signedCookies).
*
* The following example illustrates how to check for an `accessToken` in a custom cookie, query string parameter
* and header called `foo-auth`.
*
* ```js
* app.use(loopback.token({
*   cookies: ['foo-auth'],
*   headers: ['foo-auth', 'X-Foo-Auth'],
*   params: ['foo-auth', 'foo_auth']
* }));
* ```
*
* @options {Object} [options] Each option array is used to add additional keys to find an `accessToken` for a `request`.
* @property {Array} [cookies] Array of cookie names.
* @property {Array} [headers] Array of header names.
* @property {Array} [params] Array of param names.
* @property {Boolean} [searchDefaultTokenKeys] Use the default search locations for Token in request
* @property {Boolean} [enableDoublecheck] Execute middleware although an instance mounted earlier in the chain didn't find a token
* @property {Boolean} [overwriteExistingToken] only has effect in combination with `enableDoublecheck`. If truthy, will allow to overwrite an existing accessToken.
* @property {Function|String} [model] AccessToken model name or class to use.
* @property {String} [currentUserLiteral] String literal for the current user.
* @property {Boolean} [bearerTokenBase64Encoded] Defaults to `true`. For `Bearer` token based `Authorization` headers,
* decode the value from `Base64`. If set to `false`, the decoding will be skipped and the token id will be the raw value
* parsed from the header.
* @header loopback.token([options])
*/

declare function token(options?: {cookies?: Array<any>, headers?: Array<any>, params?: Array<any>, searchDefaultTokenKeys?: Boolean, enableDoublecheck?: Boolean, overwriteExistingToken?: Boolean, model?: Function|String, currentUserLiteral?: String, bearerTokenBase64Encoded?: Boolean}):void;

/**
* Convert any request not handled so far to a 404 error
* to be handled by error-handling middleware.
* @header loopback.urlNotFound()
*/

declare function urlNotFound():void;

/**
* Token based authentication and access control.
*
* **Default ACLs**
*
*  - DENY EVERYONE `*`
*  - ALLOW EVERYONE create
*
* @property {String} id Generated token ID.
* @property {Number} ttl Time to live in seconds, 2 weeks by default.
* @property {Date} created When the token was created.
* @property {Object} settings Extends the `Model.settings` object.
* @property {Number} settings.accessTokenIdLength Length of the base64-encoded string access token. Default value is 64.
* Increase the length for a more secure access token.
*
* @class AccessToken
* @inherits {PersistedModel}
*/

declare class AccessToken {

      /**
      * Anonymous Token
      *
      * ```js
      * assert(AccessToken.ANONYMOUS.id === '$anonymous');
      * ```
      */

      ANONYMOUS():void;

      /**
      * Create a cryptographically random access token id.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {String} token
      */

      createAccessTokenId(callback: (err: Error, token: String) => void):void;

      /**
      * Extract the access token id from the HTTP request
      * @param {Request} req HTTP request object
      * @options {Object} [options] Each option array is used to add additional keys to find an `accessToken` for a `request`.
      * @property {Array} [cookies] Array of cookie names.
      * @property {Array} [headers] Array of header names.
      * @property {Array} [params] Array of param names.
      * @property {Boolean} [searchDefaultTokenKeys] Use the default search locations for Token in request
      * @property {Boolean} [bearerTokenBase64Encoded] Defaults to `true`. For `Bearer` token based `Authorization` headers,
      * decode the value from `Base64`. If set to `false`, the decoding will be skipped and the token id will be the raw value
      * parsed from the header.
      * @return {String} The access token
      */

      getIdForRequest(req: Request, options?: {cookies?: Array<any>, headers?: Array<any>, params?: Array<any>, searchDefaultTokenKeys?: Boolean, bearerTokenBase64Encoded?: Boolean}):void;

      /**
      * Resolve and validate the access token by id
      * @param {String} id Access token
      * @callback {Function} cb Callback function
      * @param {Error} err Error information
      * @param {Object} Resolved access token object
      */

      resolve(id: String, cb: (err: Error, Resolved: Object) => void):void;

      /**
      * Find a token for the given `ServerRequest`.
      *
      * @param {ServerRequest} req
      * @param {Object} [options] Options for finding the token
      * @callback {Function} callback
      * @param {Error} err
      * @param {AccessToken} token
      */

      findForRequest(req: ServerRequest, options?: Object, callback: (err: Error, token: AccessToken) => void):void;

      /**
      * Validate the token.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {Boolean} isValid
      */

      validate(callback: (err: Error, isValid: Boolean) => void):void;

}

/**
* A Model for access control meta data.
*
* System grants permissions to principals (users/applications, can be grouped
* into roles).
*
* Protected resource: the model data and operations
* (model/property/method/relation/…)
*
* For a given principal, such as client application and/or user, is it allowed
* to access (read/write/execute)
* the protected resource?
*
* @header ACL
* @property {String} model Name of the model.
* @property {String} property Name of the property, method, scope, or relation.
* @property {String} accessType Type of access being granted: one of READ, WRITE, or EXECUTE.
* @property {String} permission Type of permission granted. One of:
*
*  - ALARM: Generate an alarm, in a system-dependent way, the access specified in the permissions component of the ACL entry.
*  - ALLOW: Explicitly grants access to the resource.
*  - AUDIT: Log, in a system-dependent way, the access specified in the permissions component of the ACL entry.
*  - DENY: Explicitly denies access to the resource.
* @property {String} principalType Type of the principal; one of: APPLICATION, USER, ROLE.
* @property {String} principalId ID of the principal - such as appId, userId or roleId.
* @property {Object} settings Extends the `Model.settings` object.
* @property {String} settings.defaultPermission Default permission setting: ALLOW, DENY, ALARM, or AUDIT. Default is ALLOW.
* Set to DENY to prohibit all API access by default.
*
* @class ACL
* @inherits PersistedModel
*/

declare class ACL {

      /**
      * Calculate the matching score for the given rule and request
      * @param {ACL} rule The ACL entry
      * @param {AccessRequest} req The request
      * @returns {Number}
      */

      getMatchingScore(rule: ACL, req: AccessRequest):Number;

      /**
      * Get matching score for the given `AccessRequest`.
      * @param {AccessRequest} req The request
      * @returns {Number} score
      */

      score(req: AccessRequest):Number;

      /**
      * Check if the given principal is allowed to access the model/property
      * @param {String} principalType The principal type.
      * @param {String} principalId The principal ID.
      * @param {String} model The model name.
      * @param {String} property The property/method/relation name.
      * @param {String} accessType The access type.
      * @callback {Function} callback Callback function.
      * @param {String|Error} err The error object.
      * @param {AccessRequest} result The resolved access request.
      */

      checkPermission(principalType: String, principalId: String, model: String, property: String, accessType: String, callback: (err: String|Error, result: AccessRequest) => void):void;

      /**
      * Test if ACL's permission is ALLOW
      * @param {String} permission The permission to test, expects one of 'ALLOW', 'DENY', 'DEFAULT'
      * @param {String} defaultPermission The default permission to apply if not providing a finite one in the permission parameter
      * @returns {Boolean} true if ACL permission is ALLOW
      */

      isAllowed(permission: String, defaultPermission: String):Boolean;

      /**
      * Test if ACL's permission is ALLOW
      * @param {String} defaultPermission The default permission to apply if missing in ACL instance
      * @returns {Boolean} true if ACL permission is ALLOW
      */

      isAllowed(defaultPermission: String):Boolean;

      /**
      * Check if the request has the permission to access.
      * @options {AccessContext|Object} context
      * An AccessContext instance or a plain object with the following properties.
      * @property {Object[]} principals An array of principals.
      * @property {String|Model} model The model name or model class.
      * @property {*} modelId The model instance ID.
      * @property {String} property The property/method/relation name.
      * @property {String} accessType The access type:
      * READ, REPLICATE, WRITE, or EXECUTE.
      * @callback {Function} callback Callback function
      * @param {String|Error} err The error object.
      * @param {AccessRequest} result The resolved access request.
      */

      checkAccessForContext(context: {principals: Object[], model: String|Model, modelId: any, property: String, accessType: String}, callback: (err: String|Error, result: AccessRequest) => void):void;

      /**
      * Check if the given access token can invoke the method
      * @param {AccessToken} token The access token
      * @param {String} model The model name
      * @param {*} modelId The model id
      * @param {String} method The method name
      * @callback {Function} callback Callback function
      * @param {String|Error} err The error object
      * @param {Boolean} allowed is the request allowed
      */

      checkAccessForToken(token: AccessToken, model: String, modelId: any, method: String, callback: (err: String|Error, allowed: Boolean) => void):void;

      /**
      * Resolve a principal by type/id
      * @param {String} type Principal type - ROLE/APP/USER
      * @param {String|Number} id Principal id or name
      * @callback {Function} callback Callback function
      * @param {String|Error} err The error object
      * @param {Object} result An instance of principal (Role, Application or User)
      */

      resolvePrincipal(type: String, id: String|Number, callback: (err: String|Error, result: Object) => void):void;

      /**
      * Check if the given principal is mapped to the role
      * @param {String} principalType Principal type
      * @param {String|*} principalId Principal id/name
      * @param {String|*} role Role id/name
      * @callback {Function} callback Callback function
      * @param {String|Error} err The error object
      * @param {Boolean} isMapped is the ACL mapped to the role
      */

      isMappedToRole(principalType: String, principalId: String|any, role: String|any, callback: (err: String|Error, isMapped: Boolean) => void):void;

}

/**
* Manage client applications and organize their users.
*
* @property {String} id  Generated ID.
* @property {String} name Name; required.
* @property {String} description Text description
* @property {String} icon String Icon image URL.
* @property {String} owner User ID of the developer who registers the application.
* @property {String} email E-mail address
* @property {Boolean} emailVerified Whether the e-mail is verified.
* @property {String} url OAuth 2.0  application URL.
* @property {String}[] callbackUrls The OAuth 2.0 code/token callback URL.
* @property {String} status Status of the application; Either `production`, `sandbox` (default), or `disabled`.
* @property {Date} created Date Application object was created.  Default: current date.
* @property {Date} modified Date Application object was modified.  Default: current date.
*
* @property {Object} pushSettings.apns APNS configuration, see the options
*   below and also
*   https://github.com/argon/node-apn/blob/master/doc/apn.markdown
* @property {Boolean} pushSettings.apns.production Whether to use production Apple Push Notification Service (APNS) servers to send push notifications.
* If true, uses `gateway.push.apple.com:2195` and `feedback.push.apple.com:2196`.
* If false, uses `gateway.sandbox.push.apple.com:2195` and `feedback.sandbox.push.apple.com:2196`
* @property {String} pushSettings.apns.certData The certificate data loaded from the cert.pem file (APNS).
* @property {String} pushSettings.apns.keyData The key data loaded from the key.pem file (APNS).
* @property {String} pushSettings.apns.pushOptions.gateway (APNS).
* @property {Number} pushSettings.apns.pushOptions.port (APNS).
* @property {String} pushSettings.apns.feedbackOptions.gateway  (APNS).
* @property {Number} pushSettings.apns.feedbackOptions.port (APNS).
* @property {Boolean} pushSettings.apns.feedbackOptions.batchFeedback (APNS).
* @property {Number} pushSettings.apns.feedbackOptions.interval (APNS).
* @property {String} pushSettings.gcm.serverApiKey: Google Cloud Messaging API key.
*
* @property {Boolean} authenticationEnabled
* @property {Boolean} anonymousAllowed
* @property {Array} authenticationSchemes List of authentication schemes
*  (see below).
* @property {String} authenticationSchemes.scheme Scheme name.
*   Supported values: `local`, `facebook`, `google`,
*   `twitter`, `linkedin`, `github`.
* @property {Object} authenticationSchemes.credential
*   Scheme-specific credentials.
*
* @class Application
* @inherits {PersistedModel}
*/

declare class Application {

      /**
      * Register a new application
      * @param {String} owner Owner's user ID.
      * @param {String} name  Name of the application
      * @param {Object} options  Other options
      * @callback {Function} callback  Callback function
      * @param {Error} err
      * @promise
      */

      register(owner: String, name: String, options: Object, callback: (err: Error) => void):void;

      /**
      * Reset keys for the application instance
      * @callback {Function} callback
      * @param {Error} err
      */

      resetKeys(callback: (err: Error) => void):void;

      /**
      * Reset keys for a given application by the appId
      * @param {Any} appId
      * @callback {Function} callback
      * @param {Error} err
      * @promise
      */

      resetKeys(appId: any, callback: (err: Error) => void):void;

      /**
      * Authenticate the application id and key.
      *
      * @param {Any} appId
      * @param {String} key
      * @callback {Function} callback
      * @param {Error} err
      * @param {String} matched The matching key; one of:
      * - clientKey
      * - javaScriptKey
      * - restApiKey
      * - windowsKey
      * - masterKey
      * @promise
      */

      authenticate(appId: any, key: String, callback: (err: Error, matched: String) => void):void;

}

/**
* Change list entry.
*
* @property {String} id Hash of the modelName and ID.
* @property {String} rev The current model revision.
* @property {String} prev The previous model revision.
* @property {Number} checkpoint The current checkpoint at time of the change.
* @property {String} modelName Model name.
* @property {String} modelId Model ID.
* @property {Object} settings Extends the `Model.settings` object.
* @property {String} settings.hashAlgorithm Algorithm used to create cryptographic hash, used as argument
* to [crypto.createHash](http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm).  Default is sha1.
* @property {Boolean} settings.ignoreErrors By default, when changes are rectified, an error will throw an exception.
* However, if this setting is true, then errors will not throw exceptions.
* @class Change
* @inherits {PersistedModel}
*/

declare class Change {

      /**
      * Track the recent change of the given modelIds.
      *
      * @param  {String}   modelName
      * @param  {Array}    modelIds
      * @callback {Function} callback
      * @param {Error} err
      * @param {Array} changes Changes that were tracked
      */

      rectifyModelChanges(modelName: String, modelIds: Array<any>, callback: (err: Error, changes: Array<any>) => void):void;

      /**
      * Get an identifier for a given model.
      *
      * @param  {String} modelName
      * @param  {String} modelId
      * @return {String}
      */

      idForModel(modelName: String, modelId: String):void;

      /**
      * Find or create a change for the given model.
      *
      * @param  {String}   modelName
      * @param  {String}   modelId
      * @callback  {Function} callback
      * @param {Error} err
      * @param {Change} change
      * @end
      */

      findOrCreateChange(modelName: String, modelId: String, callback: (err: Error, change: Change) => void):void;

      /**
      * Update (or create) the change with the current revision.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {Change} change
      */

      rectify(callback: (err: Error, change: Change) => void):void;

      /**
      * Get a change's current revision based on current data.
      * @callback  {Function} callback
      * @param {Error} err
      * @param {String} rev The current revision
      */

      currentRevision(callback: (err: Error, rev: String) => void):void;

      /**
      * Create a hash of the given `string` with the `options.hashAlgorithm`.
      * **Default: `sha1`**
      *
      * @param  {String} str The string to be hashed
      * @return {String}     The hashed string
      */

      hash(str: String):void;

      /**
      * Get the revision string for the given object
      * @param  {Object} inst The data to get the revision string for
      * @return {String}      The revision string
      */

      revisionForInst(inst: Object):void;

      /**
      * Get a change's type. Returns one of:
      *
      * - `Change.UPDATE`
      * - `Change.CREATE`
      * - `Change.DELETE`
      * - `Change.UNKNOWN`
      *
      * @return {String} the type of change
      */

      type():void;

      /**
      * Compare two changes.
      * @param  {Change} change
      * @return {Boolean}
      */

      equals(change: Change):void;

      /**
      * Does this change conflict with the given change.
      * @param  {Change} change
      * @return {Boolean}
      */

      conflictsWith(change: Change):void;

      /**
      * Are both changes deletes?
      * @param  {Change} a
      * @param  {Change} b
      * @return {Boolean}
      */

      bothDeleted(a: Change, b: Change):void;

      /**
      * Determine if the change is based on the given change.
      * @param  {Change} change
      * @return {Boolean}
      */

      isBasedOn(change: Change):void;

      /**
      * Determine the differences for a given model since a given checkpoint.
      *
      * The callback will contain an error or `result`.
      *
      * **result**
      *
      * ```js
      * {
      *   deltas: Array,
      *   conflicts: Array
      * }
      * ```
      *
      * **deltas**
      *
      * An array of changes that differ from `remoteChanges`.
      *
      * **conflicts**
      *
      * An array of changes that conflict with `remoteChanges`.
      *
      * @param  {String}   modelName
      * @param  {Number}   since         Compare changes after this checkpoint
      * @param  {Change[]} remoteChanges A set of changes to compare
      * @callback  {Function} callback
      * @param {Error} err
      * @param {Object} result See above.
      */

      diff(modelName: String, since: Number, remoteChanges: Change[], callback: (err: Error, result: Object) => void):void;

      /**
      * Correct all change list entries.
      * @param {Function} cb
      */

      rectifyAll(cb: Function):void;

      /**
      * Get the checkpoint model.
      * @return {Checkpoint}
      */

      getCheckpointModel():void;

      /**
      * Get the `Model` class for `change.modelName`.
      * @return {Model}
      */

      getModelCtor():void;

      /**
      * When two changes conflict a conflict is created.
      *
      * **Note**: call `conflict.fetch()` to get the `target` and `source` models.
      *
      * @param {*} modelId
      * @param {PersistedModel} SourceModel
      * @param {PersistedModel} TargetModel
      * @property {ModelClass} source The source model instance
      * @property {ModelClass} target The target model instance
      * @class Change.Conflict
      */

}

      declare class Conflict {

      /**
      * Fetch the conflicting models.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {PersistedModel} source
      * @param {PersistedModel} target
      */

      models(callback: (err: Error, source: PersistedModel, target: PersistedModel) => void):void;

      /**
      * Get the conflicting changes.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {Change} sourceChange
      * @param {Change} targetChange
      */

      changes(callback: (err: Error, sourceChange: Change, targetChange: Change) => void):void;

      /**
      * Resolve the conflict.
      *
      * Set the source change's previous revision to the current revision of the
      * (conflicting) target change. Since the changes are no longer conflicting
      * and appear as if the source change was based on the target, they will be
      * replicated normally as part of the next replicate() call.
      *
      * This is effectively resolving the conflict using the source version.
      *
      * @callback {Function} callback
      * @param {Error} err
      */

      resolve(callback: (err: Error) => void):void;

      /**
      * Resolve the conflict using the instance data in the source model.
      *
      * @callback {Function} callback
      * @param {Error} err
      */

      resolveUsingSource(callback: (err: Error) => void):void;

      /**
      * Resolve the conflict using the instance data in the target model.
      *
      * @callback {Function} callback
      * @param {Error} err
      */

      resolveUsingTarget(callback: (err: Error) => void):void;

      /**
      * Return a new Conflict instance with swapped Source and Target models.
      *
      * This is useful when resolving a conflict in one-way
      * replication, where the source data must not be changed:
      *
      * ```js
      * conflict.swapParties().resolveUsingTarget(cb);
      * ```
      *
      * @returns {Conflict} A new Conflict instance.
      */

      swapParties():Conflict;

      /**
      * Resolve the conflict using the supplied instance data.
      *
      * @param {Object} data The set of changes to apply on the model
      * instance. Use `null` value to delete the source instance instead.
      * @callback {Function} callback
      * @param {Error} err
      */

      resolveManually(data: Object, callback: (err: Error) => void):void;

      /**
      * Determine the conflict type.
      *
      * Possible results are
      *
      *  - `Change.UPDATE`: Source and target models were updated.
      *  - `Change.DELETE`: Source and or target model was deleted.
      *  - `Change.UNKNOWN`: the conflict type is uknown or due to an error.
      *
      * @callback {Function} callback
      * @param {Error} err
      * @param {String} type The conflict type.
      */

      type(callback: (err: Error, type: String) => void):void;

}

/**
* Email model.  Extends LoopBack base [Model](#model-new-model).
* @property {String} to Email addressee.  Required.
* @property {String} from Email sender address.  Required.
* @property {String} subject Email subject string.  Required.
* @property {String} text Text body of email.
* @property {String} html HTML body of email.
*
* @class Email
* @inherits {Model}
*/

declare class Email {

      /**
      * Send an email with the given `options`.
      *
      * Example Options:
      *
      * ```js
      * {
      *   from: "Fred Foo <foo@blurdybloop.com>", // sender address
      *   to: "bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
      *   subject: "Hello", // Subject line
      *   text: "Hello world", // plaintext body
      *   html: "<b>Hello world</b>" // html body
      * }
      * ```
      *
      * See https://github.com/andris9/Nodemailer for other supported options.
      *
      * @options {Object} options See below
      * @prop {String} from Senders's email address
      * @prop {String} to List of one or more recipient email addresses (comma-delimited)
      * @prop {String} subject Subject line
      * @prop {String} text Body text
      * @prop {String} html Body HTML (optional)
      * @param {Function} callback Called after the e-mail is sent or the sending failed
      */

      send(callback: Function, options: {}):void;

      /**
      * A shortcut for Email.send(this).
      */

      send():void;

}

/**
* Data model for key-value databases.
*
* @class KeyValueModel
* @inherits {Model}
*/

declare class KeyValueModel {

      /**
      * Return the value associated with a given key.
      *
      * @param {String} key Key to use when searching the database.
      * @options {Object} options
      * @callback {Function} callback
      * @param {Error} err Error object.
      * @param {Any} result Value associated with the given key.
      * @promise
      *
      * @header KeyValueModel.get(key, cb)
      */

      get(key: String, options: {}, callback: (err: Error, result: any) => void):void;

      /**
      * Persist a value and associate it with the given key.
      *
      * @param {String} key Key to associate with the given value.
      * @param {Any} value Value to persist.
      * @options {Number|Object} options Optional settings for the key-value
      *   pair. If a Number is provided, it is set as the TTL (time to live) in ms
      *   (milliseconds) for the key-value pair.
      * @property {Number} ttl TTL for the key-value pair in ms.
      * @callback {Function} callback
      * @param {Error} err Error object.
      * @promise
      *
      * @header KeyValueModel.set(key, value, cb)
      */

      set(key: String, value: any, options: {ttl: Number}, callback: (err: Error) => void):void;

      /**
      * Set the TTL (time to live) in ms (milliseconds) for a given key. TTL is the
      * remaining time before a key-value pair is discarded from the database.
      *
      * @param {String} key Key to use when searching the database.
      * @param {Number} ttl TTL in ms to set for the key.
      * @options {Object} options
      * @callback {Function} callback
      * @param {Error} err Error object.
      * @promise
      *
      * @header KeyValueModel.expire(key, ttl, cb)
      */

      expire(key: String, ttl: Number, options: {}, callback: (err: Error) => void):void;

      /**
      * Return the TTL (time to live) for a given key. TTL is the remaining time
      * before a key-value pair is discarded from the database.
      *
      * @param {String} key Key to use when searching the database.
      * @options {Object} options
      * @callback {Function} callback
      * @param {Error} error
      * @param {Number} ttl Expiration time for the key-value pair. `undefined` if
      *   TTL was not initially set.
      * @promise
      *
      * @header KeyValueModel.ttl(key, cb)
      */

      ttl(key: String, options: {}, callback: (error: Error, ttl: Number) => void):void;

      /**
      * Return all keys in the database.
      *
      * **WARNING**: This method is not suitable for large data sets as all
      * key-values pairs are loaded into memory at once. For large data sets,
      * use `iterateKeys()` instead.
      *
      * @param {Object} filter An optional filter object with the following
      * @param {String} filter.match Glob string used to filter returned
      *   keys (i.e. `userid.*`). All connectors are required to support `*` and
      *   `?`, but may also support additional special characters specific to the
      *   database.
      * @param {Object} options
      * @callback {Function} callback
      * @promise
      *
      * @header KeyValueModel.keys(filter, cb)
      */

      keys(filter: Object, filterMatch: String, options: Object, callback: () => void):void;

      /**
      * Asynchronously iterate all keys in the database. Similar to `.keys()` but
      * instead allows for iteration over large data sets without having to load
      * everything into memory at once.
      *
      * Callback example:
      * ```js
      * // Given a model named `Color` with two keys `red` and `blue`
      * var iterator = Color.iterateKeys();
      * it.next(function(err, key) {
      *   // key contains `red`
      *   it.next(function(err, key) {
      *     // key contains `blue`
      *   });
      * });
      * ```
      *
      * Promise example:
      * ```js
      * // Given a model named `Color` with two keys `red` and `blue`
      * var iterator = Color.iterateKeys();
      * Promise.resolve().then(function() {
      *   return it.next();
      * })
      * .then(function(key) {
      *   // key contains `red`
      *   return it.next();
      * });
      * .then(function(key) {
      *   // key contains `blue`
      * });
      * ```
      *
      * @param {Object} filter An optional filter object with the following
      * @param {String} filter.match Glob string to use to filter returned
      *   keys (i.e. `userid.*`). All connectors are required to support `*` and
      *   `?`. They may also support additional special characters that are
      *   specific to the backing database.
      * @param {Object} options
      * @returns {AsyncIterator} An Object implementing `next(cb) -> Promise`
      *   function that can be used to iterate all keys.
      *
      * @header KeyValueModel.iterateKeys(filter)
      */

      iterateKeys(filter: Object, filterMatch: String, options: Object):AsyncIterator;

}

/**
* The Role model
* @class Role
* @header Role object
*/

declare class Role {

      /**
      * Fetch all users assigned to this role
      * @function Role.prototype#users
      * @param {object} [query] query object passed to model find call
      * @callback {Function} [callback] The callback function
      * @param {String|Error} err The error string or object
      * @param {Array} list The list of users.
      * @promise
      */

      /**
      * Fetch all applications assigned to this role
      * @function Role.prototype#applications
      * @param {object} [query] query object passed to model find call
      * @callback {Function} [callback] The callback function
      * @param {String|Error} err The error string or object
      * @param {Array} list The list of applications.
      * @promise
      */

            
            
      /**
      * Add custom handler for roles.
      * @param {String} role Name of role.
      * @param {Function} resolver Function that determines
      * if a principal is in the specified role.
      * Should provide a callback or return a promise.
      */

      registerResolver(role: String, resolver: Function):void;

      /**
      * Check if a given user ID is the owner the model instance.
      * @param {Function} modelClass The model class
      * @param {*} modelId The model ID
      * @param {*} userId The user ID
      * @param {String} principalType The user principalType (optional)
      * @options {Object} options
      * @property {accessToken} The access token used to authorize the current user.
      * @callback {Function} [callback] The callback function
      * @param {String|Error} err The error string or object
      * @param {Boolean} isOwner True if the user is an owner.
      * @promise
      */

      isOwner(modelClass: Function, modelId: any, userId: any, principalType: String, options: {The: accessToken}, callback?: (err: String|Error, isOwner: Boolean) => void):void;

      /**
      * Check if the user ID is authenticated
      * @param {Object} context The security context.
      *
      * @callback {Function} callback Callback function.
      * @param {Error} err Error object.
      * @param {Boolean} isAuthenticated True if the user is authenticated.
      * @promise
      */

      isAuthenticated(context: Object, callback: (err: Error, isAuthenticated: Boolean) => void):void;

      /**
      * Check if a given principal is in the specified role.
      *
      * @param {String} role The role name.
      * @param {Object} context The context object.
      *
      * @callback {Function} callback Callback function.
      * @param {Error} err Error object.
      * @param {Boolean} isInRole True if the principal is in the specified role.
      * @promise
      */

      isInRole(role: String, context: Object, callback: (err: Error, isInRole: Boolean) => void):void;

      /**
      * List roles for a given principal.
      * @param {Object} context The security context.
      *
      * @callback {Function} callback Callback function.
      * @param {Error} err Error object.
      * @param {String[]} roles An array of role IDs
      * @promise
      */

      getRoles(context: Object, callback: (err: Error, roles: String[]) => void):void;

}

/**
* The `RoleMapping` model extends from the built in `loopback.Model` type.
*
* @property {String} id Generated ID.
* @property {String} name Name of the role.
* @property {String} Description Text description.
*
* @class RoleMapping
* @inherits {PersistedModel}
*/

declare class RoleMapping {

      /**
      * Get the application principal
      * @callback {Function} callback
      * @param {Error} err
      * @param {Application} application
      */

      application(callback: (err: Error, application: Application) => void):void;

      /**
      * Get the user principal
      * @callback {Function} callback
      * @param {Error} err
      * @param {User} user
      */

      user(callback: (err: Error, user: User) => void):void;

      /**
      * Get the child role principal
      * @callback {Function} callback
      * @param {Error} err
      * @param {User} childUser
      */

      childRole(callback: (err: Error, childUser: User) => void):void;

}

/**
* Resource owner grants/delegates permissions to client applications
*
* For a protected resource, does the client application have the authorization
* from the resource owner (user or system)?
*
* Scope has many resource access entries
*
* @class Scope
*/

declare class Scope {

      /**
      * Check if the given scope is allowed to access the model/property
      * @param {String} scope The scope name
      * @param {String} model The model name
      * @param {String} property The property/method/relation name
      * @param {String} accessType The access type
      * @callback {Function} callback
      * @param {String|Error} err The error object
      * @param {AccessRequest} result The access permission
      */

      checkPermission(scope: String, model: String, property: String, accessType: String, callback: (err: String|Error, result: AccessRequest) => void):void;

}

/**
* Built-in User model.
* Extends LoopBack [PersistedModel](#persistedmodel-new-persistedmodel).
*
* Default `User` ACLs.
*
* - DENY EVERYONE `*`
* - ALLOW EVERYONE `create`
* - ALLOW OWNER `deleteById`
* - ALLOW EVERYONE `login`
* - ALLOW EVERYONE `logout`
* - ALLOW OWNER `findById`
* - ALLOW OWNER `updateAttributes`
*
* @property {String} username Must be unique.
* @property {String} password Hidden from remote clients.
* @property {String} email Must be valid email.
* @property {Boolean} emailVerified Set when a user's email has been verified via `confirm()`.
* @property {String} verificationToken Set when `verify()` is called.
* @property {String} realm The namespace the user belongs to. See [Partitioning users with realms](http://loopback.io/doc/en/lb2/Partitioning-users-with-realms.html) for details.
* @property {Object} settings Extends the `Model.settings` object.
* @property {Boolean} settings.emailVerificationRequired Require the email verification
* process before allowing a login.
* @property {Number} settings.ttl Default time to live (in seconds) for the `AccessToken` created by `User.login() / user.createAccessToken()`.
* Default is `1209600` (2 weeks)
* @property {Number} settings.maxTTL The max value a user can request a token to be alive / valid for.
* Default is `31556926` (1 year)
* @property {Boolean} settings.realmRequired Require a realm when logging in a user.
* @property {String} settings.realmDelimiter When set a realm is required.
* @property {Number} settings.resetPasswordTokenTTL Time to live for password reset `AccessToken`. Default is `900` (15 minutes).
* @property {Number} settings.saltWorkFactor The `bcrypt` salt work factor. Default is `10`.
* @property {Boolean} settings.caseSensitiveEmail Enable case sensitive email.
*
* @class User
* @inherits {PersistedModel}
*/

declare class User {

      /**
      * Create access token for the logged in user. This method can be overridden to
      * customize how access tokens are generated
      *
      * Supported flavours:
      *
      * ```js
      * createAccessToken(ttl, cb)
      * createAccessToken(ttl, options, cb);
      * createAccessToken(options, cb);
      * // recent addition:
      * createAccessToken(data, options, cb);
      * ```
      *
      * @options {Number|Object} [ttl|data] Either the requested ttl,
      * or an object with token properties to set (see below).
      * @property {Number} [ttl] The requested ttl
      * @property {String[]} [scopes] The access scopes granted to the token.
      * @param {Object} [options] Additional options including remoting context
      * @callback {Function} cb The callback function
      * @param {String|Error} err The error string or object
      * @param {AccessToken} token The generated access token object
      * @promise
      *
      */

      createAccessToken(options?: Object, ttl|data?: {ttl?: Number, scopes?: String[]}, cb: (err: String|Error, token: AccessToken) => void):void;

      /**
      * Normalize the credentials
      * @param {Object} credentials The credential object
      * @param {Boolean} realmRequired
      * @param {String} realmDelimiter The realm delimiter, if not set, no realm is needed
      * @returns {Object} The normalized credential object
      */

      normalizeCredentials(credentials: Object, realmRequired: Boolean, realmDelimiter: String):Object;

      /**
      * Login a user by with the given `credentials`.
      *
      * ```js
      *    User.login({username: 'foo', password: 'bar'}, function (err, token) {
      *      console.log(token.id);
      *    });
      * ```
      *
      * If the `emailVerificationRequired` flag is set for the inherited user model
      * and the email has not yet been verified then the method will return a 401
      * error that will contain the user's id. This id can be used to call the
      * `api/verify` remote method to generate a new email verification token and
      * send back the related email to the user.
      *
      * @param {Object} credentials username/password or email/password
      * @param {String[]|String} [include] Optionally set it to "user" to include
      * the user info
      * @callback {Function} callback Callback function
      * @param {Error} err Error object
      * @param {AccessToken} token Access token if login is successful
      * @promise
      */

      login(credentials: Object, include?: String[]|String, callback: (err: Error, token: AccessToken) => void):void;

      /**
      * Logout a user with the given accessToken id.
      *
      * ```js
      *    User.logout('asd0a9f8dsj9s0s3223mk', function (err) {
      *      console.log(err || 'Logged out');
      *    });
      * ```
      *
      * @param {String} accessTokenID
      * @callback {Function} callback
      * @param {Error} err
      * @promise
      */

      logout(accessTokenID: String, callback: (err: Error) => void):void;

      /**
      * Compare the given `password` with the users hashed password.
      *
      * @param {String} password The plain text password
      * @callback {Function} callback Callback function
      * @param {Error} err Error object
      * @param {Boolean} isMatch Returns true if the given `password` matches record
      * @promise
      */

      hasPassword(password: String, callback: (err: Error, isMatch: Boolean) => void):void;

      /**
      * Change this user's password.
      *
      * @param {*} userId Id of the user changing the password
      * @param {string} oldPassword Current password, required in order
      *   to strongly verify the identity of the requesting user
      * @param {string} newPassword The new password to use.
      * @param {object} [options]
      * @callback {Function} callback
      * @param {Error} err Error object
      * @promise
      */

      changePassword(userId: any, oldPassword: string, newPassword: string, options?: Object, callback: (err: Error) => void):void;

      /**
      * Change this user's password (prototype/instance version).
      *
      * @param {string} oldPassword Current password, required in order
      *   to strongly verify the identity of the requesting user
      * @param {string} newPassword The new password to use.
      * @param {object} [options]
      * @callback {Function} callback
      * @param {Error} err Error object
      * @promise
      */

      changePassword(oldPassword: string, newPassword: string, options?: Object, callback: (err: Error) => void):void;

      /**
      * Set this user's password after a password-reset request was made.
      *
      * @param {*} userId Id of the user changing the password
      * @param {string} newPassword The new password to use.
      * @param {Object} [options] Additional options including remoting context
      * @callback {Function} callback
      * @param {Error} err Error object
      * @promise
      */

      setPassword(userId: any, newPassword: string, options?: Object, callback: (err: Error) => void):void;

      /**
      * Set this user's password. The callers of this method
      * must ensure the client making the request is authorized
      * to change the password, typically by providing the correct
      * current password or a password-reset token.
      *
      * @param {string} newPassword The new password to use.
      * @param {Object} [options] Additional options including remoting context
      * @callback {Function} callback
      * @param {Error} err Error object
      * @promise
      */

      setPassword(newPassword: string, options?: Object, callback: (err: Error) => void):void;

      /**
      * Returns default verification options to use when calling User.prototype.verify()
      * from remote method /user/:id/verify.
      *
      * NOTE: the User.getVerifyOptions() method can also be used to ease the
      * building of identity verification options.
      *
      * ```js
      * var verifyOptions = MyUser.getVerifyOptions();
      * user.verify(verifyOptions);
      * ```
      *
      * This is the full list of possible params, with example values
      *
      * ```js
      * {
      *   type: 'email',
      *   mailer: {
      *     send(verifyOptions, options, cb) {
      *       // send the email
      *       cb(err, result);
      *     }
      *   },
      *   to: 'test@email.com',
      *   from: 'noreply@email.com'
      *   subject: 'verification email subject',
      *   text: 'Please verify your email by opening this link in a web browser',
      *   headers: {'Mime-Version': '1.0'},
      *   template: 'path/to/template.ejs',
      *   templateFn: function(verifyOptions, options, cb) {
      *     cb(null, 'some body template');
      *   }
      *   redirect: '/',
      *   verifyHref: 'http://localhost:3000/api/user/confirm',
      *   host: 'localhost'
      *   protocol: 'http'
      *   port: 3000,
      *   restApiRoot= '/api',
      *   generateVerificationToken: function (user, options, cb) {
      *     cb(null, 'random-token');
      *   }
      * }
      * ```
      *
      * NOTE: param `to` internally defaults to user's email but can be overriden for
      * test purposes or advanced customization.
      *
      * Static default params can be modified in your custom user model json definition
      * using `settings.verifyOptions`. Any default param can be programmatically modified
      * like follows:
      *
      * ```js
      * customUserModel.getVerifyOptions = function() {
      *   const base = MyUser.base.getVerifyOptions();
      *   return Object.assign({}, base, {
      *     // custom values
      *   });
      * }
      * ```
      *
      * Usually you should only require to modify a subset of these params
      * See `User.verify()` and `User.prototype.verify()` doc for params reference
      * and their default values.
      */

      getVerifyOptions():void;

      /**
      * Verify a user's identity by sending them a confirmation message.
      * NOTE: Currently only email verification is supported
      *
      * ```js
      * var verifyOptions = {
      *   type: 'email',
      *   from: 'noreply@example.com'
      *   template: 'verify.ejs',
      *   redirect: '/',
      *   generateVerificationToken: function (user, options, cb) {
      *     cb('random-token');
      *   }
      * };
      *
      * user.verify(verifyOptions);
      * ```
      *
      * NOTE: the User.getVerifyOptions() method can also be used to ease the
      * building of identity verification options.
      *
      * ```js
      * var verifyOptions = MyUser.getVerifyOptions();
      * user.verify(verifyOptions);
      * ```
      *
      * @options {Object} verifyOptions
      * @property {String} type Must be `'email'` in the current implementation.
      * @property {Function} mailer A mailer function with a static `.send() method.
      *  The `.send()` method must accept the verifyOptions object, the method's
      *  remoting context options object and a callback function with `(err, email)`
      *  as parameters.
      *  Defaults to provided `userModel.email` function, or ultimately to LoopBack's
      *  own mailer function.
      * @property {String} to Email address to which verification email is sent.
      *  Defaults to user's email. Can also be overriden to a static value for test
      *  purposes.
      * @property {String} from Sender email address
      *  For example `'noreply@example.com'`.
      * @property {String} subject Subject line text.
      *  Defaults to `'Thanks for Registering'` or a local equivalent.
      * @property {String} text Text of email.
      *  Defaults to `'Please verify your email by opening this link in a web browser:`
      *  followed by the verify link.
      * @property {Object} headers Email headers. None provided by default.
      * @property {String} template Relative path of template that displays verification
      *  page. Defaults to `'../../templates/verify.ejs'`.
      * @property {Function} templateFn A function generating the email HTML body
      *  from `verify()` options object and generated attributes like `options.verifyHref`.
      *  It must accept the verifyOptions object, the method's remoting context options
      *  object and a callback function with `(err, html)` as parameters.
      *  A default templateFn function is provided, see `createVerificationEmailBody()`
      *  for implementation details.
      * @property {String} redirect Page to which user will be redirected after
      *  they verify their email. Defaults to `'/'`.
      * @property {String} verifyHref The link to include in the user's verify message.
      *  Defaults to an url analog to:
      *  `http://host:port/restApiRoot/userRestPath/confirm?uid=userId&redirect=/``
      * @property {String} host The API host. Defaults to app's host or `localhost`.
      * @property {String} protocol The API protocol. Defaults to `'http'`.
      * @property {Number} port The API port. Defaults to app's port or `3000`.
      * @property {String} restApiRoot The API root path. Defaults to app's restApiRoot
      *  or `'/api'`
      * @property {Function} generateVerificationToken A function to be used to
      *  generate the verification token.
      *  It must accept the verifyOptions object, the method's remoting context options
      *  object and a callback function with `(err, hexStringBuffer)` as parameters.
      *  This function should NOT add the token to the user object, instead simply
      *  execute the callback with the token! User saving and email sending will be
      *  handled in the `verify()` method.
      *  A default token generation function is provided, see `generateVerificationToken()`
      *  for implementation details.
      * @callback {Function} cb Callback function.
      * @param {Object} options remote context options.
      * @param {Error} err Error object.
      * @param {Object} object Contains email, token, uid.
      * @promise
      */

      verify(verifyOptions: {type: String, mailer: Function, to: String, from: String, subject: String, text: String, headers: Object, template: String, templateFn: Function, redirect: String, verifyHref: String, host: String, protocol: String, port: Number, restApiRoot: String, generateVerificationToken: Function}, cb: (options: Object, err: Error, object: Object) => void):void;

      /**
      * A default verification token generator which accepts the user the token is
      * being generated for and a callback function to indicate completion.
      * This one uses the crypto library and 64 random bytes (converted to hex)
      * for the token. When used in combination with the user.verify() method this
      * function will be called with the `user` object as it's context (`this`).
      *
      * @param {object} user The User this token is being generated for.
      * @param {object} options remote context options.
      * @param {Function} cb The generator must pass back the new token with this function call.
      */

      generateVerificationToken(user: Object, options: Object, cb: Function):void;

      /**
      * Confirm the user's identity.
      *
      * @param {Any} userId
      * @param {String} token The validation token
      * @param {String} redirect URL to redirect the user to once confirmed
      * @callback {Function} callback
      * @param {Error} err
      * @promise
      */

      confirm(userId: any, token: String, redirect: String, callback: (err: Error) => void):void;

      /**
      * Create a short lived access token for temporary login. Allows users
      * to change passwords if forgotten.
      *
      * @options {Object} options
      * @prop {String} email The user's email address
      * @property {String} realm The user's realm (optional)
      * @callback {Function} callback
      * @param {Error} err
      * @promise
      */

      resetPassword(options: {realm: String}, callback: (err: Error) => void):void;

}

