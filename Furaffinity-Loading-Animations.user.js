// ==UserScript==
// @name        Furaffinity-Loading-Animations
// @namespace   Violentmonkey Scripts
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @grant       none
// @version     1.2.3
// @author      Midori Dragon
// @description Library for creating different loading animations on Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485153-furaffinity-loading-animations
// @supportURL  https://greasyfork.org/scripts/485153-furaffinity-loading-animations/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

    class LoadingBar {
        _delay = 2000;
        _baseElem;
        _loadingBar;
        constructor(baseElem) {
            this._loadingBar = document.createElement('div');
            if (!document.getElementById('flaloadingbarstyle')) {
                const style = document.createElement('style');
                style.id = 'flaloadingbarstyle';
                style.innerHTML = '@keyframes gradient { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }';
                document.head.appendChild(style);
            }
            this._baseElem = baseElem;
            this._baseElem.appendChild(this._loadingBar);
            this.updateBaseElem();
        }
        get baseElem() {
            return this._baseElem;
        }
        set baseElem(value) {
            if (this._baseElem === value) {
                return;
            }
            this._baseElem = value;
            this.updateBaseElem();
        }
        get delay() {
            return this._delay;
        }
        set delay(value) {
            if (this._delay === value) {
                return;
            }
            this._delay = value;
            this._loadingBar.style.animation = `gradient ${(this._delay / 1000)}s infinite`;
        }
        get text() {
            return this._loadingBar.textContent ?? '';
        }
        set text(value) {
            if (this._loadingBar.textContent === value) {
                return;
            }
            this._loadingBar.textContent = value;
        }
        get cornerRadius() {
            return parseFloat(this._loadingBar.style.borderRadius.trimEnd('px'));
        }
        set cornerRadius(value) {
            if (parseFloat(this._loadingBar.style.borderRadius.trimEnd('px')) === value) {
                return;
            }
            this._loadingBar.style.borderRadius = value + 'px';
        }
        get height() {
            return parseFloat(this._loadingBar.style.height.trimEnd('px'));
        }
        set height(value) {
            if (parseFloat(this._loadingBar.style.height.trimEnd('px')) === value) {
                return;
            }
            this._loadingBar.style.height = value + 'px';
            this._loadingBar.style.lineHeight = value + 'px';
        }
        get fontSize() {
            return parseFloat(this._loadingBar.style.fontSize.trimEnd('px'));
        }
        set fontSize(value) {
            if (parseFloat(this._loadingBar.style.fontSize.trimEnd('px')) === value) {
                return;
            }
            if (value != null) {
                this._loadingBar.style.fontSize = value + 'px';
            }
            else {
                this._loadingBar.style.fontSize = '';
            }
        }
        get gradient() {
            return this._loadingBar.style.background;
        }
        set gradient(value) {
            if (this._loadingBar.style.background === value) {
                return;
            }
            this._loadingBar.style.background = value;
        }
        get visible() {
            return this._loadingBar.style.display !== 'none';
        }
        set visible(value) {
            if (this._loadingBar.style.display === (value ? 'block' : 'none')) {
                return;
            }
            this._loadingBar.style.display = value ? 'block' : 'none';
        }
        dispose() {
            this.visible = false;
            this._baseElem.removeChild(this._loadingBar);
        }
        updateBaseElem() {
            this._loadingBar.className = 'fla-loadingbar';
            this._loadingBar.textContent = this.text;
            this._loadingBar.style.width = '100%';
            this._loadingBar.style.height = '60px';
            this._loadingBar.style.lineHeight = this.height + 'px';
            this._loadingBar.style.textShadow = '-1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000';
            this._loadingBar.style.fontSize = '15px';
            this._loadingBar.style.background = 'repeating-linear-gradient(to right, rgba(255,10,3,1) 0%, rgba(255,139,6,1) 8%, rgba(253,228,11,1) 16%, rgba(127,236,12,1) 26%, rgba(32,225,207,1) 36%, rgba(140,60,223,1) 46%, rgba(140,60,223,1) 54%, rgba(32,225,207,1) 64%, rgba(127,236,12,1) 74%, rgba(253,228,11,1) 84%, rgba(255,139,6,1) 92%, rgba(255,10,3,1) 100%)';
            this._loadingBar.style.backgroundSize = '200% auto';
            this._loadingBar.style.backgroundPosition = '0 100%';
            this._loadingBar.style.animation = `gradient ${(this.delay / 1000)}s infinite`;
            this._loadingBar.style.animationFillMode = 'forwards';
            this._loadingBar.style.animationTimingFunction = 'linear';
            this._loadingBar.style.display = 'none';
        }
    }

    class LoadingImage {
        delay = 100;
        doScaleImage = true;
        scaleChange = 0.05;
        scaleChangeMax = 1.2;
        scaleChangeMin = 0.8;
        doRotateImage = true;
        rotateDegrees = 5;
        _image;
        _imageContainer;
        _isGrowing = true;
        _scale = 1;
        _rotation = 0;
        _size = 60;
        _intervalId;
        _baseElem;
        constructor(baseElem) {
            this._image = document.createElement('img');
            this._image.src = 'https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png';
            this._imageContainer = document.createElement('div');
            this._baseElem = baseElem;
            this._imageContainer.appendChild(this._image);
            this._baseElem.appendChild(this._imageContainer);
            this.updateBaseElem();
        }
        get baseElem() {
            return this._baseElem;
        }
        set baseElem(value) {
            if (this._baseElem === value) {
                return;
            }
            this._baseElem = value;
            this.updateBaseElem();
        }
        get imageSrc() {
            return this._image.src;
        }
        set imageSrc(value) {
            if (this._image.src === value) {
                return;
            }
            this._image.src = value;
        }
        get rotation() {
            return this._rotation;
        }
        set rotation(value) {
            if (this._rotation === value) {
                return;
            }
            this._rotation = value;
            this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
        }
        get scale() {
            return this._scale;
        }
        set scale(value) {
            if (this._scale === value) {
                return;
            }
            this._scale = value;
            this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
        }
        get size() {
            return parseFloat(this._imageContainer.style.width.trimEnd('px'));
        }
        set size(value) {
            if (parseFloat(this._imageContainer.style.width.trimEnd('px')) === value) {
                return;
            }
            this._imageContainer.style.width = this._size + 'px';
            this._imageContainer.style.height = this._size + 'px';
        }
        get visible() {
            return this._imageContainer.style.display !== 'none';
        }
        set visible(value) {
            if (this._imageContainer.style.display === (value ? 'block' : 'none')) {
                return;
            }
            this._imageContainer.style.display = value ? 'block' : 'none';
            if (value) {
                this._intervalId = setInterval(() => {
                    this.updateAnimationFrame();
                }, this.delay);
            }
            else {
                clearInterval(this._intervalId);
            }
        }
        get isGrowing() {
            return this._isGrowing;
        }
        set isGrowing(value) {
            if (this._isGrowing === value) {
                return;
            }
            this._isGrowing = value;
        }
        dispose() {
            this.visible = false;
            this._baseElem.removeChild(this._imageContainer);
        }
        updateBaseElem() {
            this._imageContainer.className = 'fla-loading-image-container';
            this._imageContainer.style.position = 'relative';
            this._imageContainer.style.width = this.size + 'px';
            this._imageContainer.style.height = this.size + 'px';
            this._imageContainer.style.left = '50%';
            this._imageContainer.style.transform = 'translateX(-50%)';
            this._imageContainer.style.display = 'none';
            this._image.className = 'fla-loading-image';
            this._image.src = this.imageSrc;
            this._image.style.width = '100%';
            this._image.style.height = '100%';
            this._image.style.transition = 'transform 0.5s ease-in-out';
        }
        updateAnimationFrame() {
            if (this.isGrowing) {
                this._scale += this.scaleChange;
                this._rotation += this.rotateDegrees;
            }
            else {
                this._scale -= this.scaleChange;
                this._rotation -= this.rotateDegrees;
            }
            if (this._scale >= this.scaleChangeMax || this._scale <= this.scaleChangeMin) {
                this.isGrowing = !this.isGrowing;
            }
            this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
        }
    }

    class LoadingSpinner {
        _delay = 1000;
        _size = 60;
        _spinnerThickness = 4;
        _spinnerLength = 1;
        _linearSpin = false;
        _animationCurve = 'cubic-bezier(.53,.24,.46,.83)';
        _forecolorHex = '#8941de';
        _backcolorHex = '#f3f3f3';
        _baseElem;
        _spinner;
        _spinnerContainer;
        constructor(baseElem) {
            this._spinner = document.createElement('div');
            this._spinnerContainer = document.createElement('div');
            if (!document.getElementById('flaspinnerstyle')) {
                const style = document.createElement('style');
                style.id = 'flaspinnerstyle';
                style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
            this._baseElem = baseElem;
            this._spinnerContainer.appendChild(this._spinner);
            this._baseElem.appendChild(this._spinnerContainer);
            this.updateBaseElem();
        }
        get baseElem() {
            return this._baseElem;
        }
        set baseElem(value) {
            if (this._baseElem === value) {
                return;
            }
            this._baseElem = value;
            this.updateBaseElem();
        }
        get delay() {
            return this._delay;
        }
        set delay(value) {
            if (this._delay === value) {
                return;
            }
            this._delay = value;
            this._spinner.style.animation = `spin ${this._delay / 1000}s ${this.animationCurve} infinite`;
        }
        get linearSpin() {
            return this._linearSpin;
        }
        set linearSpin(value) {
            if (this._linearSpin === value) {
                return;
            }
            this._linearSpin = value;
            this._animationCurve = this._linearSpin ? 'linear' : 'cubic-bezier(.53,.24,.46,.83)';
            this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
        }
        get animationCurve() {
            return this._animationCurve;
        }
        set animationCurve(value) {
            if (this._animationCurve === value) {
                return;
            }
            this._animationCurve = value;
            this._linearSpin = this._animationCurve === 'linear';
            this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
        }
        get size() {
            return this._size;
        }
        set size(value) {
            if (this._size === value) {
                return;
            }
            this._size = value;
            this.updateSize();
        }
        get spinnerThickness() {
            return this._spinnerThickness;
        }
        set spinnerThickness(value) {
            if (this._spinnerThickness === value) {
                return;
            }
            this._spinnerThickness = value;
            this.updateSpinnerBorders();
            this.updateSize();
        }
        get spinnerLength() {
            return this._spinnerLength;
        }
        set spinnerLength(value) {
            if (this._spinnerLength === value) {
                return;
            }
            this._spinnerLength = value;
            this.updateSpinnerBorders();
        }
        get forecolorHex() {
            return this._forecolorHex;
        }
        set forecolorHex(value) {
            if (this._forecolorHex === value) {
                return;
            }
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            this._forecolorHex = value;
            this.updateSpinnerBorders();
        }
        get backcolorHex() {
            return this._backcolorHex;
        }
        set backcolorHex(value) {
            if (this._backcolorHex === value) {
                return;
            }
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            this._backcolorHex = value;
            this.updateSpinnerBorders();
        }
        get visible() {
            return this._spinnerContainer.style.display !== 'none';
        }
        set visible(value) {
            if (this._spinnerContainer.style.display === (value ? 'block' : 'none')) {
                return;
            }
            this._spinnerContainer.style.display = value ? 'block' : 'none';
        }
        dispose() {
            this.visible = false;
            this._baseElem.removeChild(this._spinnerContainer);
        }
        updateSize() {
            this._spinnerContainer.style.width = this.size + 'px';
            this._spinnerContainer.style.height = this.size + 'px';
            this._spinner.style.width = (this.size - this.spinnerThickness * 2) + 'px';
            this._spinner.style.height = (this.size - this.spinnerThickness * 2) + 'px';
        }
        updateSpinnerBorders() {
            this._spinner.style.border = this.spinnerThickness + 'px solid ' + this.backcolorHex;
            if (this.spinnerLength >= 4) {
                this._spinner.style.borderLeft = this.spinnerThickness + 'px solid ' + this._forecolorHex;
            }
            else if (this.spinnerLength >= 3) {
                this._spinner.style.borderBottom = this.spinnerThickness + 'px solid ' + this._forecolorHex;
            }
            else if (this.spinnerLength >= 2) {
                this._spinner.style.borderRight = this.spinnerThickness + 'px solid ' + this._forecolorHex;
            }
            else if (this.spinnerLength >= 1) {
                this._spinner.style.borderTop = this.spinnerThickness + 'px solid ' + this._forecolorHex;
            }
        }
        updateBaseElem() {
            this._spinnerContainer.className = 'fla-spinner-container';
            this._spinnerContainer.style.position = 'relative';
            this._spinnerContainer.style.width = this.size + 'px';
            this._spinnerContainer.style.height = this.size + 'px';
            this._spinnerContainer.style.left = '50%';
            this._spinnerContainer.style.transform = 'translateX(-50%)';
            this._spinnerContainer.style.display = 'none';
            this._spinner.className = 'fla-spinner';
            this.updateSpinnerBorders();
            this._spinner.style.borderRadius = '50%';
            this._spinner.style.position = 'relative';
            this._spinner.style.width = (this.size - this.spinnerThickness * 2) + 'px';
            this._spinner.style.height = (this.size - this.spinnerThickness * 2) + 'px';
            this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
            this.updateSize();
        }
    }

    function removeTextNodes(targetElement) {
        let removedText = '';
        // Helper function to recursively remove text nodes
        function traverseAndRemoveTextNodes(node) {
            // Loop through child nodes backwards to avoid index shifting issues
            for (let i = node.childNodes.length - 1; i >= 0; i--) {
                const child = node.childNodes[i];
                // If the child is a text node, remove it and collect its text
                if (child.nodeType === Node.TEXT_NODE) {
                    removedText += (child.textContent ?? '') + '\n';
                    node.removeChild(child);
                }
            }
        }
        // Start the recursion from the target element
        traverseAndRemoveTextNodes(targetElement);
        return removedText;
    }

    class LoadingTextSpinner {
        _characters = ['\u25DC', '\u25E0', '\u25DD', '\u25DE', '\u25E1', '\u25DF'];
        _delay = 600;
        _currIndex = -1;
        _intervalId;
        _baseElem;
        _spinner;
        _prevContainerTextContent;
        constructor(baseElem) {
            this._spinner = document.createElement('div');
            this._baseElem = baseElem;
            this._baseElem.appendChild(this._spinner);
            this.updateBaseElem();
        }
        get baseElem() {
            return this._baseElem;
        }
        set baseElem(value) {
            if (this._baseElem === value) {
                return;
            }
            this._baseElem = value;
            this.updateBaseElem();
        }
        get fontSize() {
            return parseFloat(this._spinner.style.fontSize.trimEnd('px'));
        }
        set fontSize(value) {
            if (parseFloat(this._spinner.style.fontSize.trimEnd('px')) === value) {
                return;
            }
            this._spinner.style.fontSize = value + 'px';
        }
        get visible() {
            return this._spinner.style.display !== 'none';
        }
        set visible(value) {
            if (this._spinner.style.display === (value ? 'block' : 'none')) {
                return;
            }
            this._spinner.style.display = value ? 'block' : 'none';
            if (value) {
                this.start();
            }
            else {
                this.stop();
            }
        }
        get delay() {
            return this._delay;
        }
        set delay(value) {
            if (this._delay === value) {
                return;
            }
            this._delay = value;
            if (this.visible) {
                this.stop();
                this.start();
            }
        }
        get characters() {
            return this._characters;
        }
        set characters(value) {
            if (this._characters === value) {
                return;
            }
            this._characters = value;
            if (this.visible) {
                this.stop();
                this.start();
            }
        }
        dispose() {
            this.visible = false;
            this._baseElem.removeChild(this._spinner);
        }
        start() {
            if (this._intervalId == null && this._characters.length !== 0) {
                if (this._currIndex < 0) {
                    this._currIndex = 0;
                }
                this._prevContainerTextContent = removeTextNodes(this._baseElem);
                this._spinner.textContent = '\u2800\u2800';
                this._intervalId = setInterval(() => {
                    if (this._currIndex >= this.characters.length) {
                        this._currIndex = 0;
                    }
                    this._spinner.textContent = this.characters[this._currIndex];
                    this._currIndex++;
                }, (this.delay / this.characters.length));
            }
        }
        stop() {
            if (this._intervalId != null) {
                clearInterval(this._intervalId);
                this._baseElem.textContent = this._prevContainerTextContent ?? null;
                this._intervalId = undefined;
            }
        }
        updateBaseElem() {
            this._spinner.className = 'fla-text-spinner';
            this._spinner.style.display = 'none';
            this._spinner.style.fontSize = '15px';
        }
    }

    Object.defineProperties(window, {
        FALoadingSpinner: { get: () => LoadingSpinner },
        FALoadingTextSpinner: { get: () => LoadingTextSpinner },
        FALoadingImage: { get: () => LoadingImage },
        FALoadingBar: { get: () => LoadingBar }
    });

})();
