"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require('path');
var CompilableContent_1 = require('./CompilableContent');
// fm = require('front-matter')
var fm = require('front-matter');

var View = (function (_CompilableContent_1$) {
    _inherits(View, _CompilableContent_1$);

    function View(filePath) {
        _classCallCheck(this, View);

        // TODO: remove fixed _view suffix
        return _possibleConstructorReturn(this, Object.getPrototypeOf(View).call(this, filePath, path.basename(filePath, '(_view)?.hbs')));
    }

    _createClass(View, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            return _get(Object.getPrototypeOf(View.prototype), 'load', this).call(this).then(function (view) {
                var content = fm(_this2.raw);
                if (Object.keys(content.attributes).length) {
                    _this2.config = content.attributes;
                }
                _this2.template = _this2.renderer.engine.compile(content.body);
                return _this2;
            });
        }
    }], [{
        key: 'create',
        value: function create(filePath) {
            var view = new View(filePath);
            view.renderer = this.renderer;
            return view;
        }
    }]);

    return View;
})(CompilableContent_1.CompilableContent);

exports.View = View;