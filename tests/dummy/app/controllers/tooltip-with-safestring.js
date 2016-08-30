import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    debugging() {
      this.transitionToRoute('index');
    },

    toggle() {
      this.toggleProperty('toggle');
    },
  },

  safeString: Ember.String.htmlSafe('this is a test'),

  toggle: true,

  safeStringToggle: Ember.computed('toggle', function() {
    let toggle = this.get('toggle');
    let safeString;

    if (toggle) {
      safeString = Ember.String.htmlSafe('SafeString 1');
    } else {
      safeString = Ember.String.htmlSafe('SafeString 2');
    }

    return safeString;
  }),
});
