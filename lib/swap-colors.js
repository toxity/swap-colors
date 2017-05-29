'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);

    var h = void 0,
        s = void 0,
        l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: h,
        s: s,
        l: l
    };
}

function hslToRgb(h, s, l) {
    var r = void 0,
        g = void 0,
        b = void 0;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

var colorChanger = function colorChanger(img, options) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");

    if (img.complete && img.naturalHeight !== 0) {
        replace();
    } else {
        img.onload = replace;
    }

    function replace() {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        if (Array.isArray(options)) {
            for (var i = 0; i < options.length; i++) {
                change(options[i]);
            }
        } else {
            change(options);
        }

        img.onload = null;
        img.src = canvas.toDataURL();
    }

    function change(options) {
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imgData.data;
        var range = options.range || 20;

        for (var i = 0; i < data.length; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];
            var alpha = data[i + 3];

            // skip transparent/semiTransparent pixels
            if (alpha < 200) {
                continue;
            }

            var hsl = rgbToHsl(red, green, blue);
            var hue = hsl.h * 360;

            if (hue > options.from - range && hue < options.from + range) {
                var newRgb = hslToRgb(options.to / 360, hsl.s, hsl.l);
                data[i] = newRgb.r;
                data[i + 1] = newRgb.g;
                data[i + 2] = newRgb.b;
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }
};
(function () {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object') {
        console.error("Can't find window!");
        return;
    }

    window.swapColor = colorChanger;
})();