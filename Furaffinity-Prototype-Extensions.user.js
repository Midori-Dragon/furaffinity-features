// ==UserScript==
// @name        Furaffinity-Prototype-Extensions
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.0.4
// @author      Midori Dragon
// @description Library to hold common prototype extensions for your Furaffinity Script
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions
// @supportURL  https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

    Node.prototype.insertBeforeThis = function (newNode) {
        this.parentNode?.insertBefore(newNode, this);
    };
    Node.prototype.insertAfterThis = function (newNode) {
        this.parentNode?.insertBefore(newNode, this.nextSibling);
    };
    Node.prototype.getIndexOfThis = function () {
        if (this.parentNode == null) {
            return -1;
        }
        const childrenArray = Array.from(this.parentNode.children);
        return childrenArray.indexOf(this);
    };
    Node.prototype.readdToDom = function () {
        const clone = this.cloneNode(false);
        this.parentNode?.replaceChild(clone, this);
        return clone;
    };

    String.prototype.trimEnd = function (toTrim) {
        if (toTrim == null) {
            return '';
        }
        if (toTrim === '' || this === '') {
            return this.toString();
        }
        let result = this.toString();
        while (result.endsWith(toTrim)) {
            result = result.slice(0, -toTrim.length);
        }
        return result;
    };
    String.prototype.trimStart = function (toTrim) {
        if (toTrim == null) {
            return '';
        }
        if (toTrim === '' || this === '') {
            return this.toString();
        }
        let result = this.toString();
        while (result.startsWith(toTrim)) {
            result = result.slice(toTrim.length);
        }
        return result;
    };

})();
