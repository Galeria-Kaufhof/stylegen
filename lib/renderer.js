var Q = require('q');

module.exports = function(renderer) { return {
  registerPartials(component, namespace, options) {
    component.partials.forEach((partial) => {
      name = "fubar";
      renderer.registerPartial(`${namespace}.${name}`, partial);
    });
  },

  template(component, options) {
    return renderer.compile(component.view);
  },

  partials() {
    return renderer.partials;
  },

  views() {
    return renderer.views;
  }
}};
