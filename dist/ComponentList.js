"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger_1 = require('./Logger');

var ComponentList = (function () {
    function ComponentList() {
        _classCallCheck(this, ComponentList);

        this.components = {};
    }

    _createClass(ComponentList, [{
        key: "find",
        value: function find(name) {
            var component = this.components[name];
            if (!component) {
                Logger_1.warn("ComponentList.find", "The component \"" + name + "\" could not be found.", "Maybe it is not defined yet?!");
            }
            return component;
        }
    }, {
        key: "set",
        value: function set(name, component) {
            this.components[name] = component;
        }
    }, {
        key: "keys",
        value: function keys() {
            return Object.keys(this.components);
        }
    }, {
        key: "all",
        value: function all(ids) {
            var _this = this;

            if (!!ids && ids.length > 0) {
                return ids.map(function (id) {
                    return _this.find(id);
                });
            }
            return this.keys().map(function (key) {
                return _this.find(key);
            }).filter(function (x) {
                return !!x;
            });
        }
    }]);

    return ComponentList;
})();

exports.ComponentList = ComponentList;