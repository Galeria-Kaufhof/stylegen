var Q = require('q');

module.exports = function(renderer) { return {
  registerPartials(component, namespace, options) {
    component.partials.forEach((partial) => {
      var id = component.id;
      renderer.registerPartial(`${namespace}.${id}`, partial);
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
