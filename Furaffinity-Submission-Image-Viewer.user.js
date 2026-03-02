// ==UserScript==
// @name        Furaffinity-Submission-Image-Viewer
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.3.0
// @author      Midori Dragon
// @description Library for creating custom image elements on Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer
// @supportURL  https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
  'use strict';

  /**
  * Panzoom 4.6.1 for panning and zooming elements using CSS transforms
  * Copyright Timmy Willison and other contributors
  * https://github.com/timmywil/panzoom/blob/main/MIT-License.txt
  */
  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  if (typeof window !== 'undefined') {
    // Support: IE11 only
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }
    // Support: IE11 only
    // CustomEvent is an object instead of a constructor
    if (typeof window.CustomEvent !== 'function') {
      window.CustomEvent = function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt
      };
    }
  }

  var isIE = typeof document !== 'undefined' && !!document.documentMode;
  /**
   * Lazy creation of a CSS style declaration
   */
  var divStyle;
  function createStyle() {
      if (divStyle) {
          return divStyle;
      }
      return (divStyle = document.createElement('div').style);
  }
  /**
   * Proper prefixing for cross-browser compatibility
   */
  var prefixes = ['webkit', 'moz', 'ms'];
  var prefixCache = {};
  function getPrefixedName(name) {
      if (prefixCache[name]) {
          return prefixCache[name];
      }
      var divStyle = createStyle();
      if (name in divStyle) {
          return (prefixCache[name] = name);
      }
      var capName = name[0].toUpperCase() + name.slice(1);
      var i = prefixes.length;
      while (i--) {
          var prefixedName = "".concat(prefixes[i]).concat(capName);
          if (prefixedName in divStyle) {
              return (prefixCache[name] = prefixedName);
          }
      }
  }
  /**
   * Gets a style value expected to be a number
   */
  function getCSSNum(name, style) {
      return parseFloat(style[getPrefixedName(name)]) || 0;
  }
  function getBoxStyle(elem, name, style) {
      if (style === void 0) { style = window.getComputedStyle(elem); }
      // Support: FF 68+
      // Firefox requires specificity for border
      var suffix = name === 'border' ? 'Width' : '';
      return {
          left: getCSSNum("".concat(name, "Left").concat(suffix), style),
          right: getCSSNum("".concat(name, "Right").concat(suffix), style),
          top: getCSSNum("".concat(name, "Top").concat(suffix), style),
          bottom: getCSSNum("".concat(name, "Bottom").concat(suffix), style)
      };
  }
  /**
   * Set a style using the properly prefixed name
   */
  function setStyle(elem, name, value) {
      elem.style[getPrefixedName(name)] = value;
  }
  /**
   * Constructs the transition from panzoom options
   * and takes care of prefixing the transition and transform
   */
  function setTransition(elem, options) {
      var transform = getPrefixedName('transform');
      setStyle(elem, 'transition', "".concat(transform, " ").concat(options.duration, "ms ").concat(options.easing));
  }
  /**
   * Set the transform using the proper prefix
   *
   * Override the transform setter.
   * This is exposed mostly so the user could
   * set other parts of a transform
   * aside from scale and translate.
   * Default is defined in src/css.ts.
   *
   * ```js
   * // This example always sets a rotation
   * // when setting the scale and translation
   * const panzoom = Panzoom(elem, {
   *   setTransform: (elem, { scale, x, y }) => {
   *     panzoom.setStyle('transform', `rotate(0.5turn) scale(${scale}) translate(${x}px, ${y}px)`)
   *   }
   * })
   * ```
   */
  function setTransform(elem, _a, _options) {
      var x = _a.x, y = _a.y, scale = _a.scale, isSVG = _a.isSVG;
      setStyle(elem, 'transform', "scale(".concat(scale, ") translate(").concat(x, "px, ").concat(y, "px)"));
      if (isSVG && isIE) {
          var matrixValue = window.getComputedStyle(elem).getPropertyValue('transform');
          elem.setAttribute('transform', matrixValue);
      }
  }
  /**
   * Dimensions used in containment and focal point zooming
   */
  function getDimensions(elem) {
      var parent = elem.parentNode;
      var style = window.getComputedStyle(elem);
      var parentStyle = window.getComputedStyle(parent);
      var rectElem = elem.getBoundingClientRect();
      var rectParent = parent.getBoundingClientRect();
      return {
          elem: {
              style: style,
              width: rectElem.width,
              height: rectElem.height,
              top: rectElem.top,
              bottom: rectElem.bottom,
              left: rectElem.left,
              right: rectElem.right,
              margin: getBoxStyle(elem, 'margin', style),
              border: getBoxStyle(elem, 'border', style)
          },
          parent: {
              style: parentStyle,
              width: rectParent.width,
              height: rectParent.height,
              top: rectParent.top,
              bottom: rectParent.bottom,
              left: rectParent.left,
              right: rectParent.right,
              padding: getBoxStyle(parent, 'padding', parentStyle),
              border: getBoxStyle(parent, 'border', parentStyle)
          }
      };
  }

  var events = {
      down: 'mousedown',
      move: 'mousemove',
      up: 'mouseup mouseleave'
  };
  if (typeof window !== 'undefined') {
      if (typeof window.PointerEvent === 'function') {
          events = {
              down: 'pointerdown',
              move: 'pointermove',
              up: 'pointerup pointerleave pointercancel'
          };
      }
      else if (typeof window.TouchEvent === 'function') {
          events = {
              down: 'touchstart',
              move: 'touchmove',
              up: 'touchend touchcancel'
          };
      }
  }
  function onPointer(event, elem, handler, eventOpts) {
      events[event].split(' ').forEach(function (name) {
          elem.addEventListener(name, handler, eventOpts);
      });
  }
  function destroyPointer(event, elem, handler) {
      events[event].split(' ').forEach(function (name) {
          elem.removeEventListener(name, handler);
      });
  }

  /**
   * Utilites for working with multiple pointer events
   */
  function findEventIndex(pointers, event) {
      var i = pointers.length;
      while (i--) {
          if (pointers[i].pointerId === event.pointerId) {
              return i;
          }
      }
      return -1;
  }
  function addPointer(pointers, event) {
      var i;
      // Add touches if applicable
      if (event.touches) {
          i = 0;
          for (var _i = 0, _a = event.touches; _i < _a.length; _i++) {
              var touch = _a[_i];
              touch.pointerId = i++;
              addPointer(pointers, touch);
          }
          return;
      }
      i = findEventIndex(pointers, event);
      // Update if already present
      if (i > -1) {
          pointers.splice(i, 1);
      }
      pointers.push(event);
  }
  function removePointer(pointers, event) {
      // Add touches if applicable
      if (event.touches) {
          // Remove all touches
          while (pointers.length) {
              pointers.pop();
          }
          return;
      }
      var i = findEventIndex(pointers, event);
      if (i > -1) {
          pointers.splice(i, 1);
      }
  }
  /**
   * Calculates a center point between
   * the given pointer events, for panning
   * with multiple pointers.
   */
  function getMiddle(pointers) {
      // Copy to avoid changing by reference
      pointers = pointers.slice(0);
      var event1 = pointers.pop();
      var event2;
      while ((event2 = pointers.pop())) {
          event1 = {
              clientX: (event2.clientX - event1.clientX) / 2 + event1.clientX,
              clientY: (event2.clientY - event1.clientY) / 2 + event1.clientY
          };
      }
      return event1;
  }
  /**
   * Calculates the distance between two points
   * for pinch zooming.
   * Limits to the first 2
   */
  function getDistance(pointers) {
      if (pointers.length < 2) {
          return 0;
      }
      var event1 = pointers[0];
      var event2 = pointers[1];
      return Math.sqrt(Math.pow(Math.abs(event2.clientX - event1.clientX), 2) +
          Math.pow(Math.abs(event2.clientY - event1.clientY), 2));
  }

  /**
   * Determine if an element is attached to the DOM
   * Panzoom requires this so events work properly
   */
  function isAttached(node) {
      var currentNode = node;
      while (currentNode && currentNode.parentNode) {
          if (currentNode.parentNode === document)
              return true;
          currentNode =
              currentNode.parentNode instanceof ShadowRoot
                  ? currentNode.parentNode.host
                  : currentNode.parentNode;
      }
      return false;
  }

  function getClass(elem) {
      return (elem.getAttribute('class') || '').trim();
  }
  function hasClass(elem, className) {
      return elem.nodeType === 1 && " ".concat(getClass(elem), " ").indexOf(" ".concat(className, " ")) > -1;
  }
  function isExcluded(elem, options) {
      for (var cur = elem; cur != null; cur = cur.parentNode) {
          if (hasClass(cur, options.excludeClass) || options.exclude.indexOf(cur) > -1) {
              return true;
          }
      }
      return false;
  }

  /**
   * Determine if an element is SVG by checking the namespace
   * Exception: the <svg> element itself should be treated like HTML
   */
  var rsvg = /^http:[\w\.\/]+svg$/;
  function isSVGElement(elem) {
      return rsvg.test(elem.namespaceURI) && elem.nodeName.toLowerCase() !== 'svg';
  }

  function shallowClone(obj) {
      var clone = {};
      for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
              clone[key] = obj[key];
          }
      }
      return clone;
  }

  var defaultOptions = {
      animate: false,
      canvas: false,
      cursor: 'move',
      disablePan: false,
      disableZoom: false,
      disableXAxis: false,
      disableYAxis: false,
      duration: 200,
      easing: 'ease-in-out',
      exclude: [],
      excludeClass: 'panzoom-exclude',
      handleStartEvent: function (e) {
          e.preventDefault();
          e.stopPropagation();
      },
      maxScale: 4,
      minScale: 0.125,
      overflow: 'hidden',
      panOnlyWhenZoomed: false,
      pinchAndPan: false,
      relative: false,
      setTransform: setTransform,
      startX: 0,
      startY: 0,
      startScale: 1,
      step: 0.3,
      touchAction: 'none'
  };
  function Panzoom(elem, options) {
      if (!elem) {
          throw new Error('Panzoom requires an element as an argument');
      }
      if (elem.nodeType !== 1) {
          throw new Error('Panzoom requires an element with a nodeType of 1');
      }
      if (!isAttached(elem)) {
          throw new Error('Panzoom should be called on elements that have been attached to the DOM');
      }
      options = __assign(__assign({}, defaultOptions), options);
      var isSVG = isSVGElement(elem);
      var parent = elem.parentNode;
      // Set parent styles
      parent.style.overflow = options.overflow;
      parent.style.userSelect = 'none';
      // This is important for mobile to
      // prevent scrolling while panning
      parent.style.touchAction = options.touchAction;
      (options.canvas ? parent : elem).style.cursor = options.cursor;
      // Set element styles
      elem.style.userSelect = 'none';
      elem.style.touchAction = options.touchAction;
      // The default for HTML is '50% 50%'
      // The default for SVG is '0 0'
      // SVG can't be changed in IE
      setStyle(elem, 'transformOrigin', typeof options.origin === 'string' ? options.origin : isSVG ? '0 0' : '50% 50%');
      function resetStyle() {
          parent.style.overflow = '';
          parent.style.userSelect = '';
          parent.style.touchAction = '';
          parent.style.cursor = '';
          elem.style.cursor = '';
          elem.style.userSelect = '';
          elem.style.touchAction = '';
          setStyle(elem, 'transformOrigin', '');
      }
      function setOptions(opts) {
          if (opts === void 0) { opts = {}; }
          for (var key in opts) {
              if (opts.hasOwnProperty(key)) {
                  options[key] = opts[key];
              }
          }
          // Handle option side-effects
          if (opts.hasOwnProperty('cursor') || opts.hasOwnProperty('canvas')) {
              parent.style.cursor = elem.style.cursor = '';
              (options.canvas ? parent : elem).style.cursor = options.cursor;
          }
          if (opts.hasOwnProperty('overflow')) {
              parent.style.overflow = opts.overflow;
          }
          if (opts.hasOwnProperty('touchAction')) {
              parent.style.touchAction = opts.touchAction;
              elem.style.touchAction = opts.touchAction;
          }
      }
      var x = 0;
      var y = 0;
      var scale = 1;
      var isPanning = false;
      zoom(options.startScale, { animate: false, force: true });
      // Wait for scale to update
      // for accurate dimensions
      // to constrain initial values
      setTimeout(function () {
          pan(options.startX, options.startY, { animate: false, force: true });
      });
      function trigger(eventName, detail, opts) {
          if (opts.silent) {
              return;
          }
          var event = new CustomEvent(eventName, { detail: detail });
          elem.dispatchEvent(event);
      }
      function setTransformWithEvent(eventName, opts, originalEvent) {
          var value = { x: x, y: y, scale: scale, isSVG: isSVG, originalEvent: originalEvent };
          requestAnimationFrame(function () {
              if (typeof opts.animate === 'boolean') {
                  if (opts.animate) {
                      setTransition(elem, opts);
                  }
                  else {
                      setStyle(elem, 'transition', 'none');
                  }
              }
              opts.setTransform(elem, value, opts);
              trigger(eventName, value, opts);
              trigger('panzoomchange', value, opts);
          });
          return value;
      }
      function constrainXY(toX, toY, toScale, panOptions) {
          var opts = __assign(__assign({}, options), panOptions);
          var result = { x: x, y: y, opts: opts };
          if (!(panOptions === null || panOptions === void 0 ? void 0 : panOptions.force) &&
              (opts.disablePan || (opts.panOnlyWhenZoomed && scale === opts.startScale))) {
              return result;
          }
          toX = parseFloat(toX);
          toY = parseFloat(toY);
          if (!opts.disableXAxis) {
              result.x = (opts.relative ? x : 0) + toX;
          }
          if (!opts.disableYAxis) {
              result.y = (opts.relative ? y : 0) + toY;
          }
          if (opts.contain) {
              var dims = getDimensions(elem);
              var realWidth = dims.elem.width / scale;
              var realHeight = dims.elem.height / scale;
              var scaledWidth = realWidth * toScale;
              var scaledHeight = realHeight * toScale;
              var diffHorizontal = (scaledWidth - realWidth) / 2;
              var diffVertical = (scaledHeight - realHeight) / 2;
              if (opts.contain === 'inside') {
                  var minX = (-dims.elem.margin.left - dims.parent.padding.left + diffHorizontal) / toScale;
                  var maxX = (dims.parent.width -
                      scaledWidth -
                      dims.parent.padding.left -
                      dims.elem.margin.left -
                      dims.parent.border.left -
                      dims.parent.border.right +
                      diffHorizontal) /
                      toScale;
                  result.x = Math.max(Math.min(result.x, maxX), minX);
                  var minY = (-dims.elem.margin.top - dims.parent.padding.top + diffVertical) / toScale;
                  var maxY = (dims.parent.height -
                      scaledHeight -
                      dims.parent.padding.top -
                      dims.elem.margin.top -
                      dims.parent.border.top -
                      dims.parent.border.bottom +
                      diffVertical) /
                      toScale;
                  result.y = Math.max(Math.min(result.y, maxY), minY);
              }
              else if (opts.contain === 'outside') {
                  var minX = (-(scaledWidth - dims.parent.width) -
                      dims.parent.padding.left -
                      dims.parent.border.left -
                      dims.parent.border.right +
                      diffHorizontal) /
                      toScale;
                  var maxX = (diffHorizontal - dims.parent.padding.left) / toScale;
                  result.x = Math.max(Math.min(result.x, maxX), minX);
                  var minY = (-(scaledHeight - dims.parent.height) -
                      dims.parent.padding.top -
                      dims.parent.border.top -
                      dims.parent.border.bottom +
                      diffVertical) /
                      toScale;
                  var maxY = (diffVertical - dims.parent.padding.top) / toScale;
                  result.y = Math.max(Math.min(result.y, maxY), minY);
              }
          }
          if (opts.roundPixels) {
              result.x = Math.round(result.x);
              result.y = Math.round(result.y);
          }
          return result;
      }
      function constrainScale(toScale, zoomOptions) {
          var opts = __assign(__assign({}, options), zoomOptions);
          var result = { scale: scale, opts: opts };
          if (!(zoomOptions === null || zoomOptions === void 0 ? void 0 : zoomOptions.force) && opts.disableZoom) {
              return result;
          }
          var minScale = options.minScale;
          var maxScale = options.maxScale;
          if (opts.contain) {
              var dims = getDimensions(elem);
              var elemWidth = dims.elem.width / scale;
              var elemHeight = dims.elem.height / scale;
              if (elemWidth > 1 && elemHeight > 1) {
                  var parentWidth = dims.parent.width - dims.parent.border.left - dims.parent.border.right;
                  var parentHeight = dims.parent.height - dims.parent.border.top - dims.parent.border.bottom;
                  var elemScaledWidth = parentWidth / elemWidth;
                  var elemScaledHeight = parentHeight / elemHeight;
                  if (options.contain === 'inside') {
                      maxScale = Math.min(maxScale, elemScaledWidth, elemScaledHeight);
                  }
                  else if (options.contain === 'outside') {
                      minScale = Math.max(minScale, elemScaledWidth, elemScaledHeight);
                  }
              }
          }
          result.scale = Math.min(Math.max(toScale, minScale), maxScale);
          return result;
      }
      function pan(toX, toY, panOptions, originalEvent) {
          var result = constrainXY(toX, toY, scale, panOptions);
          // Only try to set if the result is somehow different
          if (x !== result.x || y !== result.y) {
              x = result.x;
              y = result.y;
              return setTransformWithEvent('panzoompan', result.opts, originalEvent);
          }
          return { x: x, y: y, scale: scale, isSVG: isSVG, originalEvent: originalEvent };
      }
      function zoom(toScale, zoomOptions, originalEvent) {
          var result = constrainScale(toScale, zoomOptions);
          var opts = result.opts;
          if (!(zoomOptions === null || zoomOptions === void 0 ? void 0 : zoomOptions.force) && opts.disableZoom) {
              return;
          }
          toScale = result.scale;
          var toX = x;
          var toY = y;
          if (opts.focal) {
              // The difference between the point after the scale and the point before the scale
              // plus the current translation after the scale
              // neutralized to no scale (as the transform scale will apply to the translation)
              var focal = opts.focal;
              toX = (focal.x / toScale - focal.x / scale + x * toScale) / toScale;
              toY = (focal.y / toScale - focal.y / scale + y * toScale) / toScale;
          }
          var panResult = constrainXY(toX, toY, toScale, { relative: false, force: true });
          x = panResult.x;
          y = panResult.y;
          scale = toScale;
          return setTransformWithEvent('panzoomzoom', opts, originalEvent);
      }
      function zoomInOut(isIn, zoomOptions) {
          var opts = __assign(__assign(__assign({}, options), { animate: true }), zoomOptions);
          return zoom(scale * Math.exp((isIn ? 1 : -1) * opts.step), opts);
      }
      function zoomIn(zoomOptions) {
          return zoomInOut(true, zoomOptions);
      }
      function zoomOut(zoomOptions) {
          return zoomInOut(false, zoomOptions);
      }
      function zoomToPoint(toScale, point, zoomOptions, originalEvent) {
          var dims = getDimensions(elem);
          // Instead of thinking of operating on the panzoom element,
          // think of operating on the area inside the panzoom
          // element's parent
          // Subtract padding and border
          var effectiveArea = {
              width: dims.parent.width -
                  dims.parent.padding.left -
                  dims.parent.padding.right -
                  dims.parent.border.left -
                  dims.parent.border.right,
              height: dims.parent.height -
                  dims.parent.padding.top -
                  dims.parent.padding.bottom -
                  dims.parent.border.top -
                  dims.parent.border.bottom
          };
          // Adjust the clientX/clientY to ignore the area
          // outside the effective area
          var clientX = point.clientX -
              dims.parent.left -
              dims.parent.padding.left -
              dims.parent.border.left -
              dims.elem.margin.left;
          var clientY = point.clientY -
              dims.parent.top -
              dims.parent.padding.top -
              dims.parent.border.top -
              dims.elem.margin.top;
          // Adjust the clientX/clientY for HTML elements,
          // because they have a transform-origin of 50% 50%
          if (!isSVG) {
              clientX -= dims.elem.width / scale / 2;
              clientY -= dims.elem.height / scale / 2;
          }
          // Convert the mouse point from it's position over the
          // effective area before the scale to the position
          // over the effective area after the scale.
          var focal = {
              x: (clientX / effectiveArea.width) * (effectiveArea.width * toScale),
              y: (clientY / effectiveArea.height) * (effectiveArea.height * toScale)
          };
          return zoom(toScale, __assign(__assign({}, zoomOptions), { animate: false, focal: focal }), originalEvent);
      }
      function zoomWithWheel(event, zoomOptions) {
          // Need to prevent the default here
          // or it conflicts with regular page scroll
          event.preventDefault();
          var opts = __assign(__assign(__assign({}, options), zoomOptions), { animate: false });
          // Normalize to deltaX in case shift modifier is used on Mac
          var delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY;
          var wheel = delta < 0 ? 1 : -1;
          var toScale = constrainScale(scale * Math.exp((wheel * opts.step) / 3), opts).scale;
          return zoomToPoint(toScale, event, opts, event);
      }
      function reset(resetOptions) {
          var opts = __assign(__assign(__assign({}, options), { animate: true, force: true }), resetOptions);
          scale = constrainScale(opts.startScale, opts).scale;
          var panResult = constrainXY(opts.startX, opts.startY, scale, opts);
          x = panResult.x;
          y = panResult.y;
          return setTransformWithEvent('panzoomreset', opts);
      }
      var origX;
      var origY;
      var startClientX;
      var startClientY;
      var startScale;
      var startDistance;
      var pointers = [];
      function handleDown(event) {
          // Don't handle this event if the target is excluded
          if (isExcluded(event.target, options)) {
              return;
          }
          addPointer(pointers, event);
          isPanning = true;
          options.handleStartEvent(event);
          origX = x;
          origY = y;
          trigger('panzoomstart', { x: x, y: y, scale: scale, isSVG: isSVG, originalEvent: event }, options);
          // This works whether there are multiple
          // pointers or not
          var point = getMiddle(pointers);
          startClientX = point.clientX;
          startClientY = point.clientY;
          startScale = scale;
          startDistance = getDistance(pointers);
      }
      function handleMove(event) {
          if (!isPanning ||
              origX === undefined ||
              origY === undefined ||
              startClientX === undefined ||
              startClientY === undefined) {
              return;
          }
          addPointer(pointers, event);
          var current = getMiddle(pointers);
          var hasMultiple = pointers.length > 1;
          var toScale = scale;
          if (hasMultiple) {
              // A startDistance of 0 means
              // that there weren't 2 pointers
              // handled on start
              if (startDistance === 0) {
                  startDistance = getDistance(pointers);
              }
              // Use the distance between the first 2 pointers
              // to determine the current scale
              var diff = getDistance(pointers) - startDistance;
              toScale = constrainScale((diff * options.step) / 80 + startScale).scale;
              zoomToPoint(toScale, current, { animate: false }, event);
          }
          // Pan during pinch if pinchAndPan is true.
          // Note: some calculations may be off because the zoom
          // above has not yet rendered. However, the behavior
          // was removed before the new scale was used in the following
          // pan calculation.
          // See https://github.com/timmywil/panzoom/issues/512
          // and https://github.com/timmywil/panzoom/issues/606
          if (!hasMultiple || options.pinchAndPan) {
              pan(origX + (current.clientX - startClientX) / toScale, origY + (current.clientY - startClientY) / toScale, { animate: false }, event);
          }
      }
      function handleUp(event) {
          // Don't call panzoomend when panning with 2 touches
          // until both touches end
          if (pointers.length === 1) {
              trigger('panzoomend', { x: x, y: y, scale: scale, isSVG: isSVG, originalEvent: event }, options);
          }
          // Note: don't remove all pointers
          // Can restart without having to reinitiate all of them
          // Remove the pointer regardless of the isPanning state
          removePointer(pointers, event);
          if (!isPanning) {
              return;
          }
          isPanning = false;
          origX = origY = startClientX = startClientY = undefined;
      }
      var bound = false;
      function bind() {
          if (bound) {
              return;
          }
          bound = true;
          onPointer('down', options.canvas ? parent : elem, handleDown);
          onPointer('move', document, handleMove, { passive: true });
          onPointer('up', document, handleUp, { passive: true });
      }
      function destroy() {
          bound = false;
          destroyPointer('down', options.canvas ? parent : elem, handleDown);
          destroyPointer('move', document, handleMove);
          destroyPointer('up', document, handleUp);
      }
      if (!options.noBind) {
          bind();
      }
      return {
          bind: bind,
          destroy: destroy,
          eventNames: events,
          getPan: function () { return ({ x: x, y: y }); },
          getScale: function () { return scale; },
          getOptions: function () { return shallowClone(options); },
          handleDown: handleDown,
          handleMove: handleMove,
          handleUp: handleUp,
          pan: pan,
          reset: reset,
          resetStyle: resetStyle,
          setOptions: setOptions,
          setStyle: function (name, value) { return setStyle(elem, name, value); },
          zoom: zoom,
          zoomIn: zoomIn,
          zoomOut: zoomOut,
          zoomToPoint: zoomToPoint,
          zoomWithWheel: zoomWithWheel
      };
  }
  Panzoom.defaultOptions = defaultOptions;

  class FAImage {
      imgElem;
      panzoom = null;
      _zoomEnabled = true;
      _panEnabled = true;
      wheelHandler = null;
      clickBlocker = null;
      _currentScale = 1;
      static DRAG_SLOP_PX = 6;
      static SCALE_EPS = 0.001;
      static ZOOM_IDLE_MS = 400;
      _downPos = null;
      _draggedSinceDown = false;
      pointerDownHandler = null;
      pointerMoveHandler = null;
      pointerUpHandler = null;
      _panzoomInitialized = false;
      _zoomIdleTimer = null;
      constructor(zoomEnabled = true, panEnabled = true) {
          this.imgElem = document.createElement('img');
          this.imgElem.classList.add('siv-fa-image', 'blocked-content');
          this.imgElem.draggable = false;
          this._zoomEnabled = zoomEnabled;
          this._panEnabled = panEnabled;
          if (zoomEnabled || panEnabled) {
              this.initializePanzoom();
          }
      }
      initializePanzoom() {
          // Wait for the element to be added to DOM and image to load
          const setupWhenReady = () => {
              if (this.imgElem.parentElement && this.imgElem.complete) {
                  this.setupPanzoom();
                  return true;
              }
              return false;
          };
          // Try immediate setup
          if (setupWhenReady()) {
              return;
          }
          // Wait for image load
          this.imgElem.addEventListener('load', () => {
              if (setupWhenReady()) {
                  return;
              }
              // If still not ready, observe DOM changes
              const observer = new MutationObserver(() => {
                  if (setupWhenReady()) {
                      observer.disconnect();
                  }
              });
              observer.observe(document.body, { childList: true, subtree: true });
          }, { once: true });
          // observe DOM changes in case image is already loaded
          const observer = new MutationObserver(() => {
              if (setupWhenReady()) {
                  observer.disconnect();
              }
          });
          observer.observe(document.body, { childList: true, subtree: true });
      }
      applyCursor(cursor) {
          this.imgElem.style.setProperty('cursor', cursor, 'important');
      }
      setupPanzoom() {
          if (!this.imgElem.parentElement) {
              return;
          }
          this.panzoom = Panzoom(this.imgElem, {
              maxScale: 10,
              minScale: 1,
              cursor: '',
              disablePan: !this._panEnabled,
              disableZoom: !this._zoomEnabled,
              panOnlyWhenZoomed: true,
              startScale: 1,
              startX: 0,
              startY: 0
          });
          this.applyCursor('pointer');
          this.imgElem.addEventListener('panzoomstart', () => {
              this.applyCursor('grabbing');
          });
          this.imgElem.addEventListener('panzoomend', () => {
              this.applyCursor('pointer');
          });
          this.imgElem.addEventListener('panzoomchange', (e) => {
              this._currentScale = e.detail.scale;
              if (this._zoomIdleTimer != null) {
                  clearTimeout(this._zoomIdleTimer);
              }
              this._zoomIdleTimer = setTimeout(() => {
                  this._zoomIdleTimer = null;
                  if (Math.abs(this._currentScale - 1) < FAImage.SCALE_EPS) {
                      this.panzoom?.reset({ animate: true });
                  }
              }, FAImage.ZOOM_IDLE_MS);
          });
          this.pointerDownHandler = (e) => {
              this._downPos = { x: e.clientX, y: e.clientY };
              this._draggedSinceDown = false;
              try {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
              }
              catch { }
          };
          this.pointerMoveHandler = (e) => {
              if (!this._downPos) {
                  return;
              }
              const dx = e.clientX - this._downPos.x;
              const dy = e.clientY - this._downPos.y;
              if ((dx * dx + dy * dy) >= (FAImage.DRAG_SLOP_PX * FAImage.DRAG_SLOP_PX)) {
                  this._draggedSinceDown = true;
              }
          };
          this.pointerUpHandler = (e) => {
              this._downPos = null;
              try {
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
              }
              catch { }
          };
          this.imgElem.addEventListener('pointerdown', this.pointerDownHandler);
          this.imgElem.addEventListener('pointermove', this.pointerMoveHandler);
          this.imgElem.addEventListener('pointerup', this.pointerUpHandler);
          this.imgElem.addEventListener('pointercancel', this.pointerUpHandler);
          // Block link activation while dragging or when zoomed
          if (!this.clickBlocker) {
              this.clickBlocker = (e) => {
                  // Block link activation while dragging OR when zoomed
                  if (this._draggedSinceDown) {
                      e.preventDefault();
                      e.stopPropagation();
                  }
                  // reset for the next gesture
                  this._draggedSinceDown = false;
              };
              this.imgElem.addEventListener('click', this.clickBlocker, { capture: true });
          }
          // Enable wheel zooming
          if (this._zoomEnabled && !this.wheelHandler) {
              this.wheelHandler = (e) => {
                  e.preventDefault();
                  this.panzoom.zoomWithWheel(e);
              };
              // non-passive to allow preventDefault
              this.imgElem.addEventListener('wheel', this.wheelHandler, { passive: false });
          }
      }
      get dataFullviewSrc() {
          return this.imgElem.getAttribute('data-fullview-src') ?? '';
      }
      set dataFullviewSrc(value) {
          this.imgElem.setAttribute('data-fullview-src', value);
      }
      get dataPreviewSrc() {
          return this.imgElem.getAttribute('data-preview-src') ?? '';
      }
      set dataPreviewSrc(value) {
          if (value == null) {
              return;
          }
          this.imgElem.setAttribute('data-preview-src', value);
      }
      set src(value) {
          this.imgElem.src = value;
          this.dataFullviewSrc = value;
      }
      get zoomEnabled() {
          return this._zoomEnabled;
      }
      set zoomEnabled(value) {
          this._zoomEnabled = value;
          if (!this._panzoomInitialized) {
              this.initializePanzoom();
          }
          this.panzoom?.setOptions({ disableZoom: !value });
          if (value) {
              if (!this.wheelHandler) {
                  this.wheelHandler = (e) => {
                      e.preventDefault();
                      this.panzoom?.zoomWithWheel(e);
                  };
                  this.imgElem.addEventListener('wheel', this.wheelHandler, { passive: false });
              }
          }
          else if (this.wheelHandler) {
              this.imgElem.removeEventListener('wheel', this.wheelHandler);
              this.wheelHandler = null;
          }
      }
      get panEnabled() {
          return this._panEnabled;
      }
      set panEnabled(value) {
          this._panEnabled = value;
          if (!this._panzoomInitialized) {
              this.initializePanzoom();
          }
          this.panzoom?.setOptions({ disablePan: !value });
      }
      reset() {
          if (this.panzoom) {
              this.panzoom.reset();
          }
          this._currentScale = 1;
          this._downPos = null;
          this._draggedSinceDown = false;
      }
      destroy() {
          if (this.wheelHandler) {
              this.imgElem.removeEventListener('wheel', this.wheelHandler);
              this.wheelHandler = null;
          }
          if (this.clickBlocker) {
              this.imgElem.removeEventListener('click', this.clickBlocker, { capture: true });
              this.clickBlocker = null;
          }
          // remove pointer listeners
          if (this.pointerDownHandler != null) {
              this.imgElem.removeEventListener('pointerdown', this.pointerDownHandler);
              this.pointerDownHandler = null;
          }
          if (this.pointerMoveHandler != null) {
              this.imgElem.removeEventListener('pointermove', this.pointerMoveHandler);
              this.pointerMoveHandler = null;
          }
          if (this.pointerUpHandler != null) {
              this.imgElem.removeEventListener('pointerup', this.pointerUpHandler);
              this.pointerUpHandler = null;
          }
          this.imgElem.removeEventListener('pointercancel', this.pointerUpHandler);
          this.imgElem.style.removeProperty('cursor');
          this.panzoom?.destroy();
          this.panzoom = null;
      }
  }

  function waitForCondition(condition) {
      return new Promise((resolve) => {
          const check = () => {
              if (condition()) {
                  resolve();
              }
              else {
                  requestAnimationFrame(check);
              }
          };
          check();
      });
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".siv-image-main {\n    object-fit: cover;\n    grid-column: 1;\n    grid-row: 1;\n}\n\n.siv-image-preview {\n    object-fit: cover;\n    image-rendering: pixelated;\n    grid-column: 1;\n    grid-row: 1;\n}\n\n.siv-image-container {\n    width: 0px;\n    height: 0px;\n    overflow: hidden;\n}\n\n.siv-parent-container {\n    display: grid;\n    overflow: hidden;\n}\n\n.zoomable-image {\n    transition: transform 0.3s;\n    transform-origin: center;\n}";
  styleInject(css_248z);

  var LogLevel;
  (function (LogLevel) {
      LogLevel[LogLevel["Error"] = 1] = "Error";
      LogLevel[LogLevel["Warning"] = 2] = "Warning";
      LogLevel[LogLevel["Info"] = 3] = "Info";
  })(LogLevel || (LogLevel = {}));
  class Logger {
      static get _logLevel() {
          window.__FF_GLOBAL_LOG_LEVEL__ ??= LogLevel.Error;
          return window.__FF_GLOBAL_LOG_LEVEL__;
      }
      static setLogLevel(logLevel) {
          window.__FF_GLOBAL_LOG_LEVEL__ = logLevel;
      }
      static get logError() {
          return LogLevel.Error <= Logger._logLevel ? console.error.bind(console) : () => { };
      }
      static get logWarning() {
          return LogLevel.Warning <= Logger._logLevel ? console.warn.bind(console) : () => { };
      }
      static get logInfo() {
          return LogLevel.Info <= Logger._logLevel ? console.log.bind(console) : () => { };
      }
  }

  function checkTags(element) {
      const userLoggedIn = document.body.getAttribute('data-user-logged-in') === '1';
      if (!userLoggedIn) {
          Logger.logWarning('User is not logged in, skipping tag check');
          setBlockedState(element, false);
          return;
      }
      const tagsHideMissingTags = document.body.getAttribute('data-tag-blocklist-hide-tagless') === '1';
      const tags = element.getAttribute('data-tags')?.trim().split(/\s+/);
      let blockReason = '';
      if (tags != null && tags.length > 0 && tags[0] !== '') {
          // image has tags
          const blockedTags = getBannedTags(tags);
          if (blockedTags.length <= 0) {
              setBlockedState(element, false);
          }
          else {
              setBlockedState(element, true);
              Logger.logInfo(`${element.id} blocked tags: ${blockedTags.join(', ')}`);
              // provide hint
              blockReason = 'Blocked tags:\n';
              for (const tag of blockedTags) {
                  blockReason += '• ' + tag + '\n';
              }
          }
      }
      else {
          // image has no tags
          setBlockedState(element, tagsHideMissingTags);
          // provide hint
          if (tagsHideMissingTags) {
              blockReason = 'Content is missing tags.';
          }
      }
      if (blockReason !== '' && element.id !== 'submissionImg') {
          // apply hint to everything but main image on submission view page
          //element.setAttribute('data-block-reason', block_reason);
          element.setAttribute('title', blockReason);
      }
  }
  function getBannedTags(tags) {
      const blockedTags = document.body.getAttribute('data-tag-blocklist') ?? '';
      const tagsBlocklist = Array.from(blockedTags.split(' '));
      let bTags = [];
      if (tags == null || tags.length === 0) {
          return [];
      }
      for (const tag of tags) {
          for (const blockedTag of tagsBlocklist) {
              if (tag === blockedTag) {
                  bTags.push(blockedTag);
              }
          }
      }
      // Remove dupes and return
      return [...new Set(bTags)];
  }
  function setBlockedState(element, isBlocked) {
      element.classList[isBlocked ? 'add' : 'remove']('blocked-content');
  }

  class CustomImageViewer extends EventTarget {
      imageUrl;
      previewUrl;
      parentContainer;
      faImage;
      faImagePreview;
      _imageLoaded;
      _invisibleContainer;
      _onImageLoad;
      _onImageLoadStart;
      _onPreviewImageLoad;
      get onImageLoad() {
          return this._onImageLoad;
      }
      set onImageLoad(handler) {
          this._onImageLoad = handler;
      }
      get onImageLoadStart() {
          return this._onImageLoadStart;
      }
      set onImageLoadStart(handler) {
          this._onImageLoadStart = handler;
      }
      get onPreviewImageLoad() {
          return this._onPreviewImageLoad;
      }
      set onPreviewImageLoad(handler) {
          this._onPreviewImageLoad = handler;
      }
      constructor(parentContainer, imageUrl, previewUrl) {
          super();
          Object.setPrototypeOf(this, CustomImageViewer.prototype);
          this.imageUrl = imageUrl;
          this.previewUrl = previewUrl;
          this.parentContainer = parentContainer;
          this.parentContainer.classList.add('siv-parent-container');
          this.faImage = new FAImage();
          this.faImage.imgElem.classList.add('siv-image-main');
          this.faImage.imgElem.addEventListener('load', this.faImageLoaded.bind(this));
          this.faImagePreview = new FAImage(false, false);
          this.faImagePreview.imgElem.classList.add('siv-image-preview');
          this._invisibleContainer = document.createElement('div');
          this._invisibleContainer.classList.add('siv-image-container');
          this._imageLoaded = false;
          this.reset();
      }
      get imageLoaded() {
          return this._imageLoaded;
      }
      set imageLoaded(value) {
          if (this._imageLoaded === value) {
              return;
          }
          this._imageLoaded = value;
          if (value) {
              this.invokeImageLoad();
          }
      }
      reset() {
          this.imageLoaded = false;
          this.faImage.imgElem.parentNode?.removeChild(this.faImage.imgElem);
          this.faImagePreview.imgElem.parentNode?.removeChild(this.faImagePreview.imgElem);
          this.faImage.src = this.imageUrl;
          this.faImage.dataPreviewSrc = this.previewUrl;
          if (this.previewUrl == null) {
              this.faImagePreview.src = '';
          }
          else {
              this.faImagePreview.src = this.previewUrl;
              this.faImagePreview.imgElem.addEventListener('load', this.invokePreviewImageLoad.bind(this));
          }
      }
      destroy() {
          this.faImage.destroy();
          this.faImagePreview.destroy();
      }
      destroyPreview() {
          this.faImagePreview.destroy();
      }
      async load() {
          this.reset();
          checkTags(this.faImage.imgElem);
          this._invisibleContainer.appendChild(this.faImage.imgElem);
          document.body.appendChild(this._invisibleContainer);
          if (this.previewUrl != null && !this.imageLoaded) {
              checkTags(this.faImagePreview.imgElem);
              await this.checkImageLoadStart();
          }
      }
      async checkImageLoadStart() {
          const condition = () => this.faImage.imgElem.offsetWidth !== 0;
          await waitForCondition(condition);
          this.faImagePreview.imgElem.style.width = this.faImage.imgElem.offsetWidth + 'px';
          this.faImagePreview.imgElem.style.height = this.faImage.imgElem.offsetHeight + 'px';
          if (!this.imageLoaded) {
              this.parentContainer.appendChild(this.faImagePreview.imgElem);
              const previewCondition = () => this.faImagePreview.imgElem.offsetWidth !== 0;
              await waitForCondition(previewCondition);
              if (!this.imageLoaded) {
                  this.parentContainer.appendChild(this.faImage.imgElem);
                  this._invisibleContainer.parentNode?.removeChild(this._invisibleContainer);
              }
              this.invokeImageLoadStart();
          }
      }
      faImageLoaded() {
          this.faImagePreview.imgElem.parentNode?.removeChild(this.faImagePreview.imgElem);
          if (this._invisibleContainer.contains(this.faImage.imgElem)) {
              this.parentContainer.appendChild(this.faImage.imgElem);
              this._invisibleContainer.parentNode?.removeChild(this._invisibleContainer);
          }
          this.imageLoaded = true;
      }
      invokeImageLoad() {
          this._onImageLoad?.();
          this.dispatchEvent(new Event('image-load'));
      }
      invokeImageLoadStart() {
          this._onImageLoadStart?.();
          this.dispatchEvent(new Event('image-load-start'));
      }
      invokePreviewImageLoad() {
          this._onPreviewImageLoad?.();
          this.dispatchEvent(new Event('preview-image-load'));
      }
  }

  Object.defineProperties(window, {
      FAImageViewer: {
          get: () => CustomImageViewer
      }
  });

})();
