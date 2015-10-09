/**
 * Created by zubair on 23/09/2015.
 */

App.favicon = {

    /**
     * Declaration of variables
     */
    icon        : {},
    currentIcon : null,
    originalIcon: null,
    image       : null,
    canvas      : null,
    options     : {},
    size        : (16 * (window.devicePixelRatio || 1)),
    browser     : null,

    /**
     * Default values for the styling favicon badge
     */
    defaults: {
        width     : 10,
        height    : 12,
        font      : 9 * (window.devicePixelRatio || 1) + 'px arial',
        colour    : '#ffffff',
        background: '#F03D25',
        abbreviate: true
    },

    /**
     * Initialize with default options
     */
    init: function () {
        this.getAgents();
        this.setOptions(this.defaults);
    },

    /**
     * Get favicon tag from the DOM
     * @returns {*}
     */
    getTag: function () {

        var links = document.getElementsByTagName('link');

        for (var i = 0, len = links.length; i < len; i++) {
            if ((links[i].getAttribute('rel') || '').match(/\bicon\b/)) {
                return links[i];
            }
        }

        return false;
    },

    /**
     * Get the current favicon control
     * @returns {*}
     */
    getCurrentIcon: function () {

        if (!this.originalIcon || !this.currentIcon) {
            var tag           = this.getTag();
            this.originalIcon = this.currentIcon = tag ? tag.getAttribute('href') : '/favicon.ico';
        }

        return this.currentIcon;
    },

    /**
     * Get a Canvas to draw the badge
     * @returns {null}
     */
    getCanvas: function () {

        if (!this.canvas) {
            this.canvas       = document.createElement('canvas');
            this.canvas.width = this.canvas.height = this.size;
        }

        return this.canvas;
    },

    /**
     * Create and set the DOM element
     * @param url
     */
    setTag: function (url) {
        if (url) {
            var link  = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel  = 'icon';
            link.href = url;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    },

    /**
     * Draw  the canvas icon
     * @param label
     * @param colour
     */
    setIcon: function (label, colour) {
        var me            = this,
            context       = this.getCanvas().getContext('2d'),
            src           = this.getCurrentIcon();
        colour            = colour || '#000000';
        label             = label || '';
        this.image        = document.createElement('img');
        this.image.onload = function () {

            // clear canvas
            context.clearRect(0, 0, me.size, me.size);

            // draw the favicon
            context.drawImage(me.image, 0, 0, me.image.width, me.image.height, 0, 0, me.size, me.size);

            // draw bubble over the top
            if ((label + '').length > 0) {
                me.drawBadge(context, label, colour);
            }

            // refresh tag in page
            me.refreshIcon();
        };

        this.image.src = src;
    },

    /**
     * Draw the favicon badge
     * @param context
     * @param label
     * @param colour
     */
    drawBadge: function (context, label, colour) {
        var me = this;

        var r = (window.devicePixelRatio || 1),
            number;
        // automatic abbreviation for long (>2 digits) numbers
        if (typeof label == 'number' && label > 99 && this.options.abbreviate) {
            //abbreviate for 1000s
            console.log(label);
            if (label.toString().length > 3) {
                number = (Number(label) / 1000);
                label  = number + 'k';
                console.log(label);
            }
        }

        var len = (label + '').length - 1;

        var width  = this.options.width * r + (6 * r * len),
            height = this.options.height * r;

        var top    = this.size - height,
            left   = this.size - width - r,
            bottom = 16 * r,
            right  = 16 * r,
            radius = 2 * r;

        //webkit font fix
        context.font        = (this.browser.webkit ? 'bold ' : '') + this.options.font;
        context.fillStyle   = this.options.background;
        context.strokeStyle = this.options.background;
        context.lineWidth   = r;

        //badge
        context.beginPath();
        context.moveTo(left + radius, top);
        context.quadraticCurveTo(left, top, left, top + radius);
        context.lineTo(left, bottom - radius);
        context.quadraticCurveTo(left, bottom, left + radius, bottom);
        context.lineTo(right - radius, bottom);
        context.quadraticCurveTo(right, bottom, right, bottom - radius);
        context.lineTo(right, top + radius);
        context.quadraticCurveTo(right, top, right - radius, top);
        context.closePath();
        context.fill();

        //shadow
        context.beginPath();
        context.strokeStyle = 'rgba(0,0,0,0.3)';
        context.moveTo(left + radius / 2.0, bottom);
        context.lineTo(right - radius / 2.0, bottom);
        context.stroke();

        //label
        context.fillStyle    = this.options.colour;
        context.textAlign    = 'right';
        context.textBaseline = 'top';

        //pixel difference if it is gecko/mozilla
        context.fillText(label, r === 2 ? 29 : 15, me.browser.mozilla ? 7 * r : 6 * r);
    },

    /**
     * Refresh the Favicon
     */
    refreshIcon: function () {

        if (!this.getCanvas().getContext) {
            return;
        }
        this.setTag(this.getCanvas().toDataURL());
    },

    /**
     * User Agent for the browser (for compatibility)
     */
    getAgents: function () {
        var userAgent = function () {
            var agent = navigator.userAgent.toLowerCase();
            return function (browser) {
                return agent.indexOf(browser) !== -1;
            };
        };
        this.browser  = {
            ie     : userAgent('msie'),
            chrome : userAgent('chrome'),
            webkit : userAgent('chrome') || userAgent('safari'),
            safari : userAgent('safari') && !userAgent('chrome'),
            mozilla: userAgent('mozilla') && !userAgent('chrome') && !ua('safari')
        };
    },

    /**
     * Setting custom options
     * @param custom
     */
    setOptions: function (custom) {
        this.options = {};

        for (var key in this.defaults) {
            this.options[key] = custom.hasOwnProperty(key) ? custom[key] : defaults[key];
        }
    }
};