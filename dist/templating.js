"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Partial = (function () {
    function Partial(path) {
        _classCallCheck(this, Partial);

        this.path = path;
    }

    _createClass(Partial, [{
        key: "load",
        value: function load() {
            return true;
        }
    }]);

    return Partial;
})();

exports.Partial = Partial;

var View = (function () {
    function View(path) {
        _classCallCheck(this, View);

        this.path = path;
    }

    _createClass(View, [{
        key: "load",
        value: function load() {
            return true;
        }
    }]);

    return View;
})();

exports.View = View;