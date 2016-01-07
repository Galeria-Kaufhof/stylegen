'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var Doc_1 = require('./Doc');

var State = function () {
    function State(id, component, config) {
        _classCallCheck(this, State);

        this.id = id;
        this.component = component;
        this.config = config;
        this.label = config.label;
        this.context = config.context;
    }

    _createClass(State, [{
        key: 'load',
        value: function load() {
            var _this = this;

            if (!!this.config.doc) {
                var p = path.resolve(this.component.config.path, this.config.doc);
                return Doc_1.Doc.create(p, this.config.doc).load().then(function (doc) {
                    _this.doc = doc;
                    return Promise.resolve(_this);
                });
            } else {
                return Promise.resolve(this);
            }
        }
    }]);

    return State;
}();

exports.State = State;