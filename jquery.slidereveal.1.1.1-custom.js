/*! slidereveal - v1.1.1 - 2016-03-04
* https://github.com/nnattawat/slidereveal
* Copyright (c) 2016 Nattawat Nonsung; Licensed MIT */

/*
* NOTE: This is customized to 
*       - accept a custom 'options.containerTargetSelector' instead of the hardcoded "body"
*       - accept a custom 'options.bottom', to allow for page footers as well
*       - push will affect the left or right margins of the container target, not it's actual left property
*       - added a setWidth method to adjust the drawer width, whether it's open or not
*/
(function ($) {
    // Private attributes and method
    var getPadding = function ($el, side) {
        var padding = $el.css('padding-' + side);
        return padding ? +padding.substring(0, padding.length - 2) : 0;
    };

    var sidePosition = function ($el) {
        var paddingLeft = getPadding($el, 'left');
        var paddingRight = getPadding($el, 'right');
        return ($el.width() + paddingLeft + paddingRight) + "px";
    };

    var SlideReveal = function ($el, options) {
        // Define default setting
        var setting = {
            width: 250,
            push: true,
            position: "left",
            speed: 300, //ms
            trigger: undefined,
            autoEscape: true,
            show: function () { },
            shown: function () { },
            hidden: function () { },
            hide: function () { },
            top: 0,
            bottom: 0,
            overlay: false,
            zIndex: 1049,
            overlayColor: 'rgba(0,0,0,0.5)',
            containerTargetSelector: "body"
        };

        // Attributes
        this.setting = $.extend(setting, options);
        this.element = $el;

        this.init();
    };

    // Public methods
    $.extend(SlideReveal.prototype, {
        init: function () {
            var self = this;
            var setting = this.setting;
            var $el = this.element;

            var transition = "all ease " + setting.speed + "ms";
            $el.css({
                position: "fixed",
                width: setting.width,
                transition: transition,
                //height: "100%",
                top: setting.top,
                bottom: setting.bottom
            })
            .css(setting.position, "-" + sidePosition($el));

            if (setting.overlay) {
                $el.css('z-index', setting.zIndex);
                $(setting.containerTargetSelector).prepend("<div class='slide-reveal-overlay'></div>");
                $(".slide-reveal-overlay")
                .hide()
                .css({
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    'z-index': setting.zIndex - 1,
                    'background-color': setting.overlayColor,
                }).click(function () {
                    self.hide();
                });
            }

            // Add close stage
            $el.data("slide-reveal", false);

            if (setting.push) {
                $(setting.containerTargetSelector).css({
                    position: "relative",
                    "overflow-x": "hidden",
                    transition: transition,
                    left: "0px"
                });
            }

            // Attach trigger using click event
            if (setting.trigger && setting.trigger.length > 0) {
                setting.trigger.on('click.slideReveal', function () {
                    if (!$el.data("slide-reveal")) { // Show
                        self.show();
                    } else { // Hide
                        self.hide();
                    }
                });
            }

            // Bind hide event to ESC
            if (setting.autoEscape) {
                $(document).on('keydown.slideReveal', function (e) {
                    if ($('input:focus, textarea:focus').length === 0) {
                        if (e.keyCode === 27 && $el.data("slide-reveal")) { // ESC
                            self.hide();
                        }
                    }
                });
            }
        },

        show: function (triggerEvents) {
            var setting = this.setting;
            var $el = this.element;

            // trigger show() method
            if (triggerEvents === undefined || triggerEvents) { setting.show($el); }

            // show overlay
            if (setting.overlay) {
                $(".slide-reveal-overlay").show();
            }

            // slide the panel
            $el.css(setting.position, "0px");
            if (setting.push) {
                if (setting.position === "left") {
                    $(setting.containerTargetSelector).css("margin-left", sidePosition($el));
                    //$(setting.containerTargetSelector).css("left", sidePosition($el));
                } else {
                    $(setting.containerTargetSelector).css("margin-right", sidePosition($el));
                    //$(setting.containerTargetSelector).css("left", "-" + sidePosition($el));
                }
            }
            $el.data("slide-reveal", true);

            // trigger shown() method
            if (triggerEvents === undefined || triggerEvents) {
                setTimeout(function () {
                    setting.shown($el);
                }, setting.speed);
            }
        },

        hide: function (triggerEvents) {
            var setting = this.setting;
            var $el = this.element;

            // trigger hide() method
            if (triggerEvents === undefined || triggerEvents) { setting.hide($el); }

            // hide the panel
            if (setting.push) {
                if (setting.position === "left") {
                    $(setting.containerTargetSelector).css("margin-left", "0px");
                } else {
                    $(setting.containerTargetSelector).css("margin-right", "0px");
                }

                //$(setting.containerTargetSelector).css("left", "0px");
            }
            $el.css(setting.position, "-" + sidePosition($el));
            $el.data("slide-reveal", false);

            // trigger hidden() method
            if (triggerEvents === undefined || triggerEvents) {
                setTimeout(function () {
                    // hide overlay
                    if (setting.overlay) {
                        $(".slide-reveal-overlay").hide();
                    }

                    setting.hidden($el);
                }, setting.speed);
            }
        },

        toggle: function (triggerEvents) {
            var $el = this.element;
            if ($el.data('slide-reveal')) {
                this.hide(triggerEvents);
            } else {
                this.show(triggerEvents);
            }
        },

        // *** Custom function to set width
        setWidth: function (triggerEvents) {
            var $el = this.element;

            this.setting.width = triggerEvents.width;

            var setting = this.setting;
            var $el = this.element;

            if ($el.data('slide-reveal')) { // Slide reveal is open, move things around...
                // Clone object to immediately determine new width
                var $elClone = $el.clone();
                $elClone.css('transition', ''); //remove animation to immediately compute new width
                $elClone.css({
                    width: setting.width,
                });
                var containerPosition = sidePosition($elClone);

                // Adjust the actual width
                $el.css({
                    width: setting.width,
                })

                // slide the panel
                if (setting.push) {
                    if (setting.position === "left") {
                        $(setting.containerTargetSelector).css("margin-left", containerPosition);
                    } else {
                        $(setting.containerTargetSelector).css("margin-right", containerPosition);
                    }
                }
            } else { // Slide reveal is not open, simply adjust some values
                // Remove animation so that width is immediately adjusted
                var initialTransition = $el.css('transition');
                $el.css('transition', '');
                // Adjust the actual width and set offset
                $el.css({
                    width: setting.width,
                });
                $el.css(setting.position, "-" + sidePosition($el));
                //  Reset animation
                $el.css('transition', initialTransition);
            }
        }
    });

    // jQuery collection methods
    $.fn.slideReveal = function (options, triggerEvents) {
        if (options !== undefined && typeof (options) === "string") {
            this.each(function () {
                var slideReveal = $(this).data('slide-reveal-model');

                if (options === "show") {
                    slideReveal.show(triggerEvents);
                } else if (options === "hide") {
                    slideReveal.hide(triggerEvents);
                } else if (options === 'toggle') {
                    slideReveal.toggle(triggerEvents);
                } else if (options === 'setWidth') {
                    slideReveal.setWidth(triggerEvents);
                }
        });
        } else {
            this.each(function () {
                if ($(this).data('slide-reveal-model')) {
                    $(this).data('slide-reveal-model').remove();
                }
                $(this).data('slide-reveal-model', new SlideReveal($(this), options));
            });
        }

        return this;
    };

}(jQuery));
