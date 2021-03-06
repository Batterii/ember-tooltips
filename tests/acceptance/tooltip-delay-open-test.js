import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import selectorFor from '../helpers/selector-for';

let application;

module('Acceptance | tooltip delay open', {

  beforeEach() {
    application = startApp();
  },

  afterEach() {
    Ember.run(application, 'destroy');
  },

});

test('Setting the delay property should wait before making tooltip visible', function(assert) {
  const delay = 1000;

  visit('/tooltip-delay-open');

  assert.expect(8);

  let tooltip = 'delay-open-basic';
  let start = Date.now();

  mouseOver(tooltip);
  andThen(function() {
    let end = Date.now();
    let diff = end - start;

    assert.equal(Ember.$('.tooltip').length, 1, 'The tooltip should be added to the DOM on hover in the basic test');
    assert.ok(diff > delay, 'The tooltip should be visible after 1000ms in the basic test');
  });

  mouseOut(tooltip);

  // ...and then start the next test
  andThen(function() {
    tooltip = 'delay-open-component';
    start = Date.now();

    mouseOver(tooltip);
    andThen(function() {
      let end = Date.now();
      let diff = end - start;

      assert.equal(Ember.$('.tooltip').length, 1, 'The tooltip should be added to the DOM in the component test');
      assert.ok(diff > delay, 'The tooltip should be visible after 1000ms in the component test');
    });

    mouseOut(tooltip);

  });

  // ...and then start the next test
  andThen(function() {
    tooltip = 'delay-open-data';
    start = Date.now();

    click(selectorFor(tooltip));
    andThen(function() {
      let end = Date.now();
      let diff = end - start;

      assert.equal(Ember.$('.tooltip').length, 1, 'The tooltip should be added to the DOM in the data test');
      assert.ok(diff > delay, 'The tooltip should be visible after 1000ms in the data test');
    });

    click(selectorFor(tooltip));
  });

  // ...and then start the next test
  andThen(function() {
    tooltip = 'delay-open-input';
    start = Date.now();

    triggerEvent(selectorFor(tooltip), 'focus');
    andThen(function() {
      let end = Date.now();
      let diff = end - start;

      assert.equal(Ember.$('.tooltip').length, 1, 'The tooltip should be added to the DOM in the input test');
      assert.ok(diff > delay, 'The tooltip should be visible after 1000ms in the input test');
    });

    triggerEvent(selectorFor(tooltip), 'blur');
  });

});
