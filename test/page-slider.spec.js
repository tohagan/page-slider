var jsdom = require('jsdom');
var connect = require('connect');


describe('PageSlider', function () {
    var $;
    var staticServer;
    var slider;

    beforeAll(function () {
        // Start a local server for lib files
        var serveStatic = require('serve-static');
        staticServer = connect().use(serveStatic(__dirname + '/..')).listen(4242);
    });

    beforeEach(function (done) {
        // Create the DOM env
        jsdom.env({
            html: '<html><body></body></html>',
            scripts: [
                'http://localhost:4242/bower_components/jquery/dist/jquery.min.js',
                'http://localhost:4242/lib/page-slider.min.js',
            ],
            done: function (err, window) {
                if (err) console.log(err);
                $ = window.jQuery;
                PageSlider = window.PageSlider;

                slider = new PageSlider($('body'));
                done();
            }
        });
    });

    describe('once instantiated', function() {
        it('should add inline style to the container', function () {

            expect(slider.$container.css('height')).toEqual('100%');
            expect(slider.$container.css('width')).toEqual('100%');
            expect(slider.$container.css('overflow')).toEqual('hidden');
        });
    });

    describe('when the first page is slided in', function() {
        it('should call callbacks synchronously', function () {

            var beforeCalled = false;
            var afterCalled = false;

            slider.slidePageFrom($('<div>'), 'left', {
                beforeTransition: function () {
                    beforeCalled = true;
                },
                afterTransition: function () {
                    afterCalled = true;
                },
            });

            expect(beforeCalled && afterCalled).toBe(true);
        });
    });

    describe('on page slide (except the first one)', function () {

        beforeEach(function () {
            // Force the first page slide
            slider.slidePage($('<div>'));
        });

        it('should call both callbacks', function (done) {

            var beforeCalled = false;

            slider.slidePage($('<div>'), {
                beforeTransition: function () {
                    beforeCalled = true;
                },
                afterTransition: function () {
                    expect(beforeCalled).toBe(true);
                    done();
                },
            });
        });

        describe('when transition duration is modified', function() {

            beforeEach(function () {
                slider.setTransitionDurationMs(100);
            });

            it('should have modified transition duration', function () {
                expect(slider.transitionDurationMs).toBe(100);
            });

            it('should have transitions that reflect their duration', function (done) {

                var time100ms;
                var time300ms;
                var startTime = (new Date()).getTime();

                slider.slidePageFrom($('<div>'), 'left', {
                    afterTransition: function () {

                        time100ms = (new Date()).getTime() - startTime;

                        slider.setTransitionDurationMs(300);

                        startTime = (new Date()).getTime();

                        slider.slidePageFrom($('<div>'), 'left', {
                            afterTransition: function () {
                                time300ms = (new Date()).getTime() - startTime;
                                console.log(time100ms);
                                console.log(time300ms);
                                expect(time300ms).toBeGreaterThan(time100ms);
                                done();
                            },
                        });
                    },
                });

            });
        });

    });

    describe('when transitions are disabled', function() {

        beforeEach(function () {
            slider.disableTransitions();
        });

        it('should have disabled transitions', function () {
            expect(slider.transitionsEnabled).toBe(false);
        });

        it('should call callbacks synchronously', function () {
            var beforeCalled = false;
            var afterCalled = false;

            // slide in a first page
            slider.slidePage($('<div>'));

            slider.slidePageFrom($('<div>'), 'left', {
                beforeTransition: function () {
                    beforeCalled = true;
                },
                afterTransition: function () {
                    afterCalled = true;
                },
            });

            expect(beforeCalled && afterCalled).toBe(true);
        });
    });


    afterAll(function () {
        staticServer.close();
    });
});
