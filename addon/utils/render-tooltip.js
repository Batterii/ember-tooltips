
import Ember from 'ember';
import isHTMLSafe from 'ember-tooltips/utils/is-html-safe';

const { Tooltip } = window;
const { $, run } = Ember;

let tooltipIndex = 1;

/**
A utility to attach a tooltip to a DOM element.

@submodule utils
@method renderTooltip
@param {Element} domElement The DOM element, not jQuery element, to attach the tooltip to
@param {Object} options The tooltip options to render the tooltip with
*/

export default function renderTooltip(domElement, options, context) {

  Ember.assert('You must pass a DOM element as the first argument to the renderTooltip util', !domElement || (domElement && !!domElement.tagName));

  const $domElement = $(domElement);
  const parsedOptions = parseTooltipOptions(options);
  const { content, duration, event, hideOn, tabIndex, showOn, delay, delayOnChange } = parsedOptions;
  const tooltipId = `tooltip-${tooltipIndex}`;

  let $tooltip, tooltip;

  /**
  @method setTooltipVisibility
  @private
  */

  function setTooltipVisibility(shouldShow) {

    /* We debounce to avoid focus causing issues
    when showOn and hideOn are the same event */

    run.debounce(null, function() {

      run.cancel(tooltip._delayTimer);

      /* If we're setting visibility to the value
      it already is, do nothing... */

      if (tooltip.hidden === shouldShow) {
        return;
      }

      if (context && context.isDestroying) {
        return;
      }

      /* Clean previously queued removal (if present) */
      run.cancel(tooltip._hideTimer);

      if (shouldShow) {

        let showTooltipDelay = delay;
        if (!delayOnChange) {
          // If the `delayOnChange` property is set to false, we don't want to delay opening this tooltip if there is
          // already a tooltip visible in the DOM. Check that here and adjust the delay as needed.
          let visibleTooltips = Ember.$('.tooltip').length;
          showTooltipDelay = visibleTooltips ? 0 : delay;
        }

        tooltip._delayTimer = run.later(function() {
          // It's possible the parent Ember component has been destroyed before this timer fires
          if (!context || context.isDestroying || context.isDestroyed) {
            return;
          }

          tooltip.show();
          $tooltip.attr('aria-hidden', true);
          context.set('tooltipVisibility', true);
          $domElement.attr('aria-describedby', tooltipId);
          if (duration) {
            /* Hide tooltip after specified duration */
            const hideTimer = run.later(tooltip, 'hide', duration);

            /* Save timer ID for cancelling should an event
            hide the tooltop before the duration */
            tooltip._hideTimer = hideTimer;
          }
        }, showTooltipDelay);
      } else {
        tooltip.hide();
        $tooltip.attr('aria-hidden', false);
        if (context) {
          context.set('tooltipVisibility', false);
        }
        $domElement.removeAttr('aria-describedby');
      }
    }, 150);
  }

  /**
  @method parseTooltipOptions
  @private

  Manipulate the options object
  */

  function parseTooltipOptions(options = {}) {
    const newOptions = options;
    const { content, duration, event, tabIndex, typeClass, delay } = newOptions;

    /* Prefix type class */

    if (typeClass) {
      newOptions.typeClass = 'tooltip-' + typeClass;
    }

    /* Set the correct hide and show events */

    if (!newOptions.showOn) {
      if (event === 'hover') {
        newOptions.showOn = 'mouseenter';
      } else {
        newOptions.showOn = event;
      }
    }

    if (!newOptions.hideOn) {
      if (event === 'hover') {
        newOptions.hideOn = 'mouseleave';
      } else if (event === 'focus') {
        newOptions.hideOn = 'blur';
      } else if (event === 'ready') {
        newOptions.hideOn = null;
      } else {
        newOptions.hideOn = event;
      }
    }

    /* If duration is passed as a string, make it a number */

    if (duration && typeof duration === 'string') {
      let cleanDuration = parseInt(duration, 10);

      /* Remove invalid parseInt results */

      if (isNaN(cleanDuration) || !isFinite(cleanDuration)) {
        cleanDuration = null;
      }

      newOptions.duration = cleanDuration;
    }

    if (delay && typeof delay === 'string') {
      let cleanDelay = parseInt(delay, 10);

      /* Remove invalid parseInt results */

      if (isNaN(cleanDelay) || !isFinite(cleanDelay)) {
        cleanDelay = 0;
      }

      newOptions.delay = cleanDelay;
    }
    /* Make tab index a string */

    if (typeof tabIndex === 'number') {
      newOptions.tabIndex = tabIndex.toString();
    } else if (!tabIndex) {
      newOptions.tabIndex = '-1';
    }

    /* Make sure content can be passed as a SafeString */

    if (isHTMLSafe(content)) {
      newOptions.content = content.toString();
    }

    return newOptions;
  }

  /* First, create the tooltip and set the variables */

  tooltip = new Tooltip(content, parsedOptions);
  $tooltip = $(tooltip.element);

  tooltip.attach(domElement);

  if (event !== 'manual' && event !== 'none') {

    /* If show and hide are the same (e.g. click), toggle
    the visibility */

    if (showOn === hideOn) {
      $domElement.on(showOn, function() {
        setTooltipVisibility(!!tooltip.hidden);
      });
    } else {

      /* Else, add the show and hide events individually */

      if (showOn !== 'none') {
        $domElement.on(showOn, function() {
          setTooltipVisibility(true);
        });
      }

      if (hideOn !== 'none') {
        $domElement.on(hideOn, function() {
          setTooltipVisibility(false);
        });
      }
    }

    /* Hide and show the tooltip on focus and escape
    for acessibility */

    if (event !== 'focus') {
      $domElement.focusin(function() {
        setTooltipVisibility(true);
      });

      $domElement.focusout(function() {
        setTooltipVisibility(false);
      });
    }

    $domElement.keydown(function(keyEvent) {
      if (keyEvent.which === 27) {
        setTooltipVisibility(false);
        keyEvent.preventDefault();

        return false;
      }
    });
  }

  /* Setup ARIA attributes for acessibility */

  $tooltip.attr({
    id: tooltipId,
    role: 'tooltip',
  });

  $domElement.attr({
    tabindex: $domElement.attr('tabindex') || tabIndex,
    // title: $domElement.attr('title') || content.toString(), // Removed for #9
  });

  tooltipIndex++;

  return tooltip;
}
