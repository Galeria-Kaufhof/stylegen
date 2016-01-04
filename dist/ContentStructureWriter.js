"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page_1 = require('./Page');

var ContentStructureWriter = (function () {
    function ContentStructureWriter(styleguide) {
        _classCallCheck(this, ContentStructureWriter);

        this.styleguide = styleguide;
    }
    /**
     * walk config, and build page objects
     */

    _createClass(ContentStructureWriter, [{
        key: 'walk',
        value: function walk(content) {
            var _this = this;

            return Promise.all(content.map(function (pageConfig) {
                pageConfig.styleguide = _this.styleguide;
                pageConfig.target = _this.styleguide.config.target;
                return new Page_1.Page(pageConfig).build();
            })).then(function (pages) {
                _this.pages = pages;
                return _this;
            });
        }
    }, {
        key: 'write',
        value: function write(context) {
            var _this2 = this;

            context.pages = this.pages;
            var layout = this.styleguide.components.find('sg.layout').view.template;
            return Promise.all(this.pages.map(function (page) {
                return page.write(layout, context);
            })).then(function (pages) {
                return _this2;
            });
        }
    }]);

    return ContentStructureWriter;
})();

exports.ContentStructureWriter = ContentStructureWriter;