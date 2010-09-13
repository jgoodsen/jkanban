/*!
 * jQuery Form Plugin
 * version: 2.47 (04-SEP-2010)
 * @requires jQuery v1.3.2 or later
 *
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {

    /*
     Usage Note:
     -----------
     Do not use both ajaxSubmit and ajaxForm on the same form.  These
     functions are intended to be exclusive.  Use ajaxSubmit if you want
     to bind your own submit handler to the form.  For example,

     $(document).ready(function() {
     $('#myForm').bind('submit', function() {
     $(this).ajaxSubmit({
     target: '#output'
     });
     return false; // <-- important!
     });
     });

     Use ajaxForm when you want the plugin to manage all the event binding
     for you.  For example,

     $(document).ready(function() {
     $('#myForm').ajaxForm({
     target: '#output'
     });
     });

     When using ajaxForm, the ajaxSubmit function will be invoked for you
     at the appropriate time.
     */

    /**
     * ajaxSubmit() provides a mechanism for immediately submitting
     * an HTML form using AJAX.
     */
    $.fn.ajaxSubmit = function(options) {
        // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
        if (!this.length) {
            log('ajaxSubmit: skipping submit process - no element selected');
            return this;
        }

        if (typeof options == 'function') {
            options = { success: options };
        }

        var url = $.trim(this.attr('action'));
        if (url) {
            // clean url (don't include hash vaue)
            url = (url.match(/^([^#]+)/) || [])[1];
        }
        url = url || window.location.href || '';

        options = $.extend(true, {
            url:  url,
            type: this.attr('method') || 'GET',
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
        }, options);

        // hook for manipulating the form data before it is extracted;
        // convenient for use with rich editors like tinyMCE or FCKEditor
        var veto = {};
        this.trigger('form-pre-serialize', [this, options, veto]);
        if (veto.veto) {
            log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
            return this;
        }

        // provide opportunity to alter form data before it is serialized
        if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
            log('ajaxSubmit: submit aborted via beforeSerialize callback');
            return this;
        }

        var n,v,a = this.formToArray(options.semantic);
        if (options.data) {
            options.extraData = options.data;
            for (n in options.data) {
                if (options.data[n] instanceof Array) {
                    for (var k in options.data[n]) {
                        a.push({ name: n, value: options.data[n][k] });
                    }
                }
                else {
                    v = options.data[n];
                    v = $.isFunction(v) ? v() : v; // if value is fn, invoke it
                    a.push({ name: n, value: v });
                }
            }
        }

        // give pre-submit callback an opportunity to abort the submit
        if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
            log('ajaxSubmit: submit aborted via beforeSubmit callback');
            return this;
        }

        // fire vetoable 'validate' event
        this.trigger('form-submit-validate', [a, this, options, veto]);
        if (veto.veto) {
            log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
            return this;
        }

        var q = $.param(a);

        if (options.type.toUpperCase() == 'GET') {
            options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
            options.data = null;  // data is null for 'get'
        }
        else {
            options.data = q; // data is the query string for 'post'
        }

        var $form = this, callbacks = [];
        if (options.resetForm) {
            callbacks.push(function() {
                $form.resetForm();
            });
        }
        if (options.clearForm) {
            callbacks.push(function() {
                $form.clearForm();
            });
        }

        // perform a load on the target only if dataType is not provided
        if (!options.dataType && options.target) {
            var oldSuccess = options.success || function() {
            };
            callbacks.push(function(data) {
                var fn = options.replaceTarget ? 'replaceWith' : 'html';
                $(options.target)[fn](data).each(oldSuccess, arguments);
            });
        }
        else if (options.success) {
            callbacks.push(options.success);
        }

        options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
            var context = options.context || options;   // jQuery 1.4+ supports scope context
            for (var i = 0, max = callbacks.length; i < max; i++) {
                callbacks[i].apply(context, [data, status, xhr || $form, $form]);
            }
        };

        // are there files to upload?
        var fileInputs = $('input:file', this).length > 0;
        var mp = 'multipart/form-data';
        var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

        // options.iframe allows user to force iframe mode
        // 06-NOV-09: now defaulting to iframe mode if file input is detected
        if (options.iframe !== false && (fileInputs || options.iframe || multipart)) {
            // hack to fix Safari hang (thanks to Tim Molendijk for this)
            // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
            if (options.closeKeepAlive) {
                $.get(options.closeKeepAlive, fileUpload);
            }
            else {
                fileUpload();
            }
        }
        else {
            $.ajax(options);
        }

        // fire 'notify' event
        this.trigger('form-submit-notify', [this, options]);
        return this;


        // private function for handling file uploads (hat tip to YAHOO!)
        function fileUpload() {
            var form = $form[0];

            if ($(':input[name=submit],:input[id=submit]', form).length) {
                // if there is an input with a name or id of 'submit' then we won't be
                // able to invoke the submit fn on the form (at least not x-browser)
                alert('Error: Form elements must not have name or id of "submit".');
                return;
            }

            var s = $.extend(true, {}, $.ajaxSettings, options);
            s.context = s.context || s;
            var id = 'jqFormIO' + (new Date().getTime()), fn = '_' + id;
            window[fn] = function() {
                var f = $io.data('form-plugin-onload');
                if (f) {
                    f();
                    window[fn] = undefined;
                    try {
                        delete window[fn];
                    } catch(e) {
                    }
                }
            }
            var $io = $('<iframe id="' + id + '" name="' + id + '" src="' + s.iframeSrc + '" onload="window[\'_\'+this.id]()" />');
            var io = $io[0];

            $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

            var xhr = { // mock object
                aborted: 0,
                responseText: null,
                responseXML: null,
                status: 0,
                statusText: 'n/a',
                getAllResponseHeaders: function() {
                },
                getResponseHeader: function() {
                },
                setRequestHeader: function() {
                },
                abort: function() {
                    this.aborted = 1;
                    $io.attr('src', s.iframeSrc); // abort op in progress
                }
            };

            var g = s.global;
            // trigger ajax global events so that activity/block indicators work like normal
            if (g && ! $.active++) {
                $.event.trigger("ajaxStart");
            }
            if (g) {
                $.event.trigger("ajaxSend", [xhr, s]);
            }

            if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
                if (s.global) {
                    $.active--;
                }
                return;
            }
            if (xhr.aborted) {
                return;
            }

            var cbInvoked = false;
            var timedOut = 0;

            // add submitting element to data if we know it
            var sub = form.clk;
            if (sub) {
                var n = sub.name;
                if (n && !sub.disabled) {
                    s.extraData = s.extraData || {};
                    s.extraData[n] = sub.value;
                    if (sub.type == "image") {
                        s.extraData[n + '.x'] = form.clk_x;
                        s.extraData[n + '.y'] = form.clk_y;
                    }
                }
            }

            // take a breath so that pending repaints get some cpu time before the upload starts
            function doSubmit() {
                // make sure form attrs are set
                var t = $form.attr('target'), a = $form.attr('action');

                // update form attrs in IE friendly way
                form.setAttribute('target', id);
                if (form.getAttribute('method') != 'POST') {
                    form.setAttribute('method', 'POST');
                }
                if (form.getAttribute('action') != s.url) {
                    form.setAttribute('action', s.url);
                }

                // ie borks in some cases when setting encoding
                if (! s.skipEncodingOverride) {
                    $form.attr({
                        encoding: 'multipart/form-data',
                        enctype:  'multipart/form-data'
                    });
                }

                // support timout
                if (s.timeout) {
                    setTimeout(function() {
                        timedOut = true;
                        cb();
                    }, s.timeout);
                }

                // add "extra" data to form if provided in options
                var extraInputs = [];
                try {
                    if (s.extraData) {
                        for (var n in s.extraData) {
                            extraInputs.push(
                                    $('<input type="hidden" name="' + n + '" value="' + s.extraData[n] + '" />')
                                            .appendTo(form)[0]);
                        }
                    }

                    // add iframe to doc and submit the form
                    $io.appendTo('body');
                    $io.data('form-plugin-onload', cb);
                    form.submit();
                }
                finally {
                    // reset attrs and remove "extra" input elements
                    form.setAttribute('action', a);
                    if (t) {
                        form.setAttribute('target', t);
                    } else {
                        $form.removeAttr('target');
                    }
                    $(extraInputs).remove();
                }
            }

            if (s.forceSync) {
                doSubmit();
            }
            else {
                setTimeout(doSubmit, 10); // this lets dom updates render
            }

            var data, doc, domCheckCount = 50;

            function cb() {
                if (cbInvoked) {
                    return;
                }

                $io.removeData('form-plugin-onload');

                var ok = true;
                try {
                    if (timedOut) {
                        throw 'timeout';
                    }
                    // extract the server response from the iframe
                    doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;

                    var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
                    log('isXml=' + isXml);
                    if (!isXml && window.opera && (doc.body == null || doc.body.innerHTML == '')) {
                        if (--domCheckCount) {
                            // in some browsers (Opera) the iframe DOM is not always traversable when
                            // the onload callback fires, so we loop a bit to accommodate
                            log('requeing onLoad callback, DOM not available');
                            setTimeout(cb, 250);
                            return;
                        }
                        // let this fall through because server response could be an empty document
                        //log('Could not access iframe DOM after mutiple tries.');
                        //throw 'DOMException: not available';
                    }

                    //log('response detected');
                    cbInvoked = true;
                    xhr.responseText = doc.documentElement ? doc.documentElement.innerHTML : null;
                    xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                    xhr.getResponseHeader = function(header) {
                        var headers = {'content-type': s.dataType};
                        return headers[header];
                    };

                    var scr = /(json|script)/.test(s.dataType);
                    if (scr || s.textarea) {
                        // see if user embedded response in textarea
                        var ta = doc.getElementsByTagName('textarea')[0];
                        if (ta) {
                            xhr.responseText = ta.value;
                        }
                        else if (scr) {
                            // account for browsers injecting pre around json response
                            var pre = doc.getElementsByTagName('pre')[0];
                            if (pre) {
                                xhr.responseText = pre.innerHTML;
                            }
                        }
                    }
                    else if (s.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
                        xhr.responseXML = toXml(xhr.responseText);
                    }
                    data = $.httpData(xhr, s.dataType);
                }
                catch(e) {
                    log('error caught:', e);
                    ok = false;
                    xhr.error = e;
                    $.handleError(s, xhr, 'error', e);
                }

                // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
                if (ok) {
                    s.success.call(s.context, data, 'success', xhr);
                    if (g) {
                        $.event.trigger("ajaxSuccess", [xhr, s]);
                    }
                }
                if (g) {
                    $.event.trigger("ajaxComplete", [xhr, s]);
                }
                if (g && ! --$.active) {
                    $.event.trigger("ajaxStop");
                }
                if (s.complete) {
                    s.complete.call(s.context, xhr, ok ? 'success' : 'error');
                }

                // clean up
                setTimeout(function() {
                    $io.removeData('form-plugin-onload');
                    $io.remove();
                    xhr.responseXML = null;
                }, 100);
            }

            function toXml(s, doc) {
                if (window.ActiveXObject) {
                    doc = new ActiveXObject('Microsoft.XMLDOM');
                    doc.async = 'false';
                    doc.loadXML(s);
                }
                else {
                    doc = (new DOMParser()).parseFromString(s, 'text/xml');
                }
                return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
            }
        }
    };

    /**
     * ajaxForm() provides a mechanism for fully automating form submission.
     *
     * The advantages of using this method instead of ajaxSubmit() are:
     *
     * 1: This method will include coordinates for <input type="image" /> elements (if the element
     *    is used to submit the form).
     * 2. This method will include the submit element's name/value data (for the element that was
     *    used to submit the form).
     * 3. This method binds the submit() method to the form for you.
     *
     * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
     * passes the options argument along after properly binding events for submit elements and
     * the form itself.
     */
    $.fn.ajaxForm = function(options) {
        // in jQuery 1.3+ we can fix mistakes with the ready state
        if (this.length === 0) {
            var o = { s: this.selector, c: this.context };
            if (!$.isReady && o.s) {
                log('DOM not ready, queuing ajaxForm');
                $(function() {
                    $(o.s, o.c).ajaxForm(options);
                });
                return this;
            }
            // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
            log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
            return this;
        }

        return this.ajaxFormUnbind().bind('submit.form-plugin',
                function(e) {
                    if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
                        e.preventDefault();
                        $(this).ajaxSubmit(options);
                    }
                }).bind('click.form-plugin', function(e) {
            var target = e.target;
            var $el = $(target);
            if (!($el.is(":submit,input:image"))) {
                // is this a child element of the submit el?  (ex: a span within a button)
                var t = $el.closest(':submit');
                if (t.length == 0) {
                    return;
                }
                target = t[0];
            }
            var form = this;
            form.clk = target;
            if (target.type == 'image') {
                if (e.offsetX != undefined) {
                    form.clk_x = e.offsetX;
                    form.clk_y = e.offsetY;
                } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
                    var offset = $el.offset();
                    form.clk_x = e.pageX - offset.left;
                    form.clk_y = e.pageY - offset.top;
                } else {
                    form.clk_x = e.pageX - target.offsetLeft;
                    form.clk_y = e.pageY - target.offsetTop;
                }
            }
            // clear form vars
            setTimeout(function() {
                form.clk = form.clk_x = form.clk_y = null;
            }, 100);
        });
    };

    // ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
    $.fn.ajaxFormUnbind = function() {
        return this.unbind('submit.form-plugin click.form-plugin');
    };

    /**
     * formToArray() gathers form element data into an array of objects that can
     * be passed to any of the following ajax functions: $.get, $.post, or load.
     * Each object in the array has both a 'name' and 'value' property.  An example of
     * an array for a simple login form might be:
     *
     * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
     *
     * It is this array that is passed to pre-submit callback functions provided to the
     * ajaxSubmit() and ajaxForm() methods.
     */
    $.fn.formToArray = function(semantic) {
        var a = [];
        if (this.length === 0) {
            return a;
        }

        var form = this[0];
        var els = semantic ? form.getElementsByTagName('*') : form.elements;
        if (!els) {
            return a;
        }

        var i,j,n,v,el;
        for (i = 0,max = els.length; i < max; i++) {
            el = els[i];
            n = el.name;
            if (!n) {
                continue;
            }

            if (semantic && form.clk && el.type == "image") {
                // handle image inputs on the fly when semantic == true
                if (!el.disabled && form.clk == el) {
                    a.push({name: n, value: $(el).val()});
                    a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
                }
                continue;
            }

            v = $.fieldValue(el, true);
            if (v && v.constructor == Array) {
                for (j = 0,jmax = v.length; j < jmax; j++) {
                    a.push({name: n, value: v[j]});
                }
            }
            else if (v !== null && typeof v != 'undefined') {
                a.push({name: n, value: v});
            }
        }

        if (!semantic && form.clk) {
            // input type=='image' are not found in elements array! handle it here
            var $input = $(form.clk), input = $input[0];
            n = input.name;
            if (n && !input.disabled && input.type == 'image') {
                a.push({name: n, value: $input.val()});
                a.push({name: n + '.x', value: form.clk_x}, {name: n + '.y', value: form.clk_y});
            }
        }
        return a;
    };

    /**
     * Serializes form data into a 'submittable' string. This method will return a string
     * in the format: name1=value1&amp;name2=value2
     */
    $.fn.formSerialize = function(semantic) {
        //hand off to jQuery.param for proper encoding
        return $.param(this.formToArray(semantic));
    };

    /**
     * Serializes all field elements in the jQuery object into a query string.
     * This method will return a string in the format: name1=value1&amp;name2=value2
     */
    $.fn.fieldSerialize = function(successful) {
        var a = [];
        this.each(function() {
            var n = this.name;
            if (!n) {
                return;
            }
            var v = $.fieldValue(this, successful);
            if (v && v.constructor == Array) {
                for (var i = 0,max = v.length; i < max; i++) {
                    a.push({name: n, value: v[i]});
                }
            }
            else if (v !== null && typeof v != 'undefined') {
                a.push({name: this.name, value: v});
            }
        });
        //hand off to jQuery.param for proper encoding
        return $.param(a);
    };

    /**
     * Returns the value(s) of the element in the matched set.  For example, consider the following form:
     *
     *  <form><fieldset>
     *      <input name="A" type="text" />
     *      <input name="A" type="text" />
     *      <input name="B" type="checkbox" value="B1" />
     *      <input name="B" type="checkbox" value="B2"/>
     *      <input name="C" type="radio" value="C1" />
     *      <input name="C" type="radio" value="C2" />
     *  </fieldset></form>
     *
     *  var v = $(':text').fieldValue();
     *  // if no values are entered into the text inputs
     *  v == ['','']
     *  // if values entered into the text inputs are 'foo' and 'bar'
     *  v == ['foo','bar']
     *
     *  var v = $(':checkbox').fieldValue();
     *  // if neither checkbox is checked
     *  v === undefined
     *  // if both checkboxes are checked
     *  v == ['B1', 'B2']
     *
     *  var v = $(':radio').fieldValue();
     *  // if neither radio is checked
     *  v === undefined
     *  // if first radio is checked
     *  v == ['C1']
     *
     * The successful argument controls whether or not the field element must be 'successful'
     * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
     * The default value of the successful argument is true.  If this value is false the value(s)
     * for each element is returned.
     *
     * Note: This method *always* returns an array.  If no valid value can be determined the
     *       array will be empty, otherwise it will contain one or more values.
     */
    $.fn.fieldValue = function(successful) {
        for (var val = [], i = 0, max = this.length; i < max; i++) {
            var el = this[i];
            var v = $.fieldValue(el, successful);
            if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
                continue;
            }
            v.constructor == Array ? $.merge(val, v) : val.push(v);
        }
        return val;
    };

    /**
     * Returns the value of the field element.
     */
    $.fieldValue = function(el, successful) {
        var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
        if (successful === undefined) {
            successful = true;
        }

        if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
                (t == 'checkbox' || t == 'radio') && !el.checked ||
                (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
                tag == 'select' && el.selectedIndex == -1)) {
            return null;
        }

        if (tag == 'select') {
            var index = el.selectedIndex;
            if (index < 0) {
                return null;
            }
            var a = [], ops = el.options;
            var one = (t == 'select-one');
            var max = (one ? index + 1 : ops.length);
            for (var i = (one ? index : 0); i < max; i++) {
                var op = ops[i];
                if (op.selected) {
                    var v = op.value;
                    if (!v) { // extra pain for IE...
                        v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                    }
                    if (one) {
                        return v;
                    }
                    a.push(v);
                }
            }
            return a;
        }
        return $(el).val();
    };

    /**
     * Clears the form data.  Takes the following actions on the form's input fields:
     *  - input text fields will have their 'value' property set to the empty string
     *  - select elements will have their 'selectedIndex' property set to -1
     *  - checkbox and radio inputs will have their 'checked' property set to false
     *  - inputs of type submit, button, reset, and hidden will *not* be effected
     *  - button elements will *not* be effected
     */
    $.fn.clearForm = function() {
        return this.each(function() {
            $('input,select,textarea', this).clearFields();
        });
    };

    /**
     * Clears the selected form elements.
     */
    $.fn.clearFields = $.fn.clearInputs = function() {
        return this.each(function() {
            var t = this.type, tag = this.tagName.toLowerCase();
            if (t == 'text' || t == 'password' || tag == 'textarea') {
                this.value = '';
            }
            else if (t == 'checkbox' || t == 'radio') {
                this.checked = false;
            }
            else if (tag == 'select') {
                this.selectedIndex = -1;
            }
        });
    };

    /**
     * Resets the form data.  Causes all form elements to be reset to their original value.
     */
    $.fn.resetForm = function() {
        return this.each(function() {
            // guard against an input with the name of 'reset'
            // note that IE reports the reset function as an 'object'
            if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
                this.reset();
            }
        });
    };

    /**
     * Enables or disables any matching elements.
     */
    $.fn.enable = function(b) {
        if (b === undefined) {
            b = true;
        }
        return this.each(function() {
            this.disabled = !b;
        });
    };

    /**
     * Checks/unchecks any matching checkboxes or radio buttons and
     * selects/deselects and matching option elements.
     */
    $.fn.selected = function(select) {
        if (select === undefined) {
            select = true;
        }
        return this.each(function() {
            var t = this.type;
            if (t == 'checkbox' || t == 'radio') {
                this.checked = select;
            }
            else if (this.tagName.toLowerCase() == 'option') {
                var $sel = $(this).parent('select');
                if (select && $sel[0] && $sel[0].type == 'select-one') {
                    // deselect all other options
                    $sel.find('option').selected(false);
                }
                this.selected = select;
            }
        });
    };

    // helper fn for console logging
    // set $.fn.ajaxSubmit.debug to true to enable debug logging
    function log() {
        if ($.fn.ajaxSubmit.debug) {
            var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');
            if (window.console && window.console.log) {
                window.console.log(msg);
            }
            else if (window.opera && window.opera.postError) {
                window.opera.postError(msg);
            }
        }
    }

    ;

})(jQuery);


//TODO: For some reason jquery.clearonfocus.js would not load properly  so I copied it into this file - bad hack
(function($) {
    $.fn.clearOnFocus = function() {

        function clearOnFocusFocus(event) {
            if ($(this).val() == $(this).data('clearOnFocus')) {
                $(this).val('');
            }
        }

        function clearOnFocusBlur(event) {
            if ($.trim($(this).val()) == '') {
                $(this).val($(this).data('clearOnFocus'));
            }
        }

        return this.each(function() {
            $(this).data('clearOnFocus', $(this).attr('value'));

            //	unbind any previous listeners
            $(this).unbind('focus', clearOnFocusFocus);
            $(this).unbind('blur', clearOnFocusBlur);

            //	bind listeners to the functions
            $(this).bind('focus', clearOnFocusFocus);
            $(this).bind('blur', clearOnFocusBlur);
        }
                );
    };
})(jQuery);


//TODO: For some reason jquery.editinplace.js would not load properly  so I copied it into this file - bad hack

$.fn.editInPlace = function(options) {

    var settings = $.extend({}, $.fn.editInPlace.defaults, options);

    assertMandatorySettingsArePresent(settings);

    preloadImage(settings.saving_image);

    return this.each(function() {
        var dom = $(this);
        // This won't work with live queries as there is no specific element to attach this
        // one way to deal with this could be to store a reference to self and then compare that in click?
        if (dom.data('textField'))
            return; // already an editor here
        dom.data('textField', true);

        new InlineEditor(settings, dom).init();
    });
};

/// Switch these through the dictionary argument to $(aSelector).editInPlace(overideOptions)
/// Required Options: Either url or callback, so the editor knows what to do with the edited values.
$.fn.editInPlace.defaults = {
    url:                "", // string: POST URL to send edited content
    bg_over:            "#ffc", // string: background color of hover of unactivated editor
    bg_out:                "transparent", // string: background color on restore from hover
    hover_class:        "",  // string: class added to root element during hover. Will override bg_over and bg_out
    show_buttons:        false, // boolean: will show the buttons: cancel or save; will automatically cancel out the onBlur functionality
    save_button:        '<button class="inplace_save">Save</button>', // string: image button tag to use as “Save” button
    cancel_button:        '<button class="inplace_cancel">Cancel</button>', // string: image button tag to use as “Cancel” button
    params:                "", // string: example: first_name=dave&last_name=hauenstein extra paramters sent via the post request to the server
    field_type:            "text", // string: "text", "textarea", or "select";  The type of form field that will appear on instantiation
    default_text:        "(Click here to add text)", // string: text to show up if the element that has this functionality is empty
    use_html:            false, // boolean, set to true if the editor should use jQuery.fn.html() to extract the value to show from the dom node
    textarea_rows:        10, // integer: set rows attribute of textarea, if field_type is set to textarea. Use CSS if possible though
    textarea_cols:        25, // integer: set cols attribute of textarea, if field_type is set to textarea. Use CSS if possible though
    select_text:        "Choose new value", // string: default text to show up in select box
    select_options:        "", // string or array: Used if field_type is set to 'select'. Can be comma delimited list of options 'textandValue,text:value', Array of options ['textAndValue', 'text:value'] or array of arrays ['textAndValue', ['text', 'value']]. The last form is especially usefull if your labels or values contain colons)
    text_size:            null, // integer: set cols attribute of text input, if field_type is set to text. Use CSS if possible though

    // Specifying callback_skip_dom_reset will disable all saving_* options
    saving_text:        undefined, // string: text to be used when server is saving information. Example "Saving..."
    saving_image:        "", // string: uses saving text specify an image location instead of text while server is saving
    saving_animation_color: 'transparent', // hex color string, will be the color the pulsing animation during the save pulses to. Note: Only works if jquery-ui is loaded

    value_required:        false, // boolean: if set to true, the element will not be saved unless a value is entered
    element_id:            "element_id", // string: name of parameter holding the id or the editable
    update_value:        "update_value", // string: name of parameter holding the updated/edited value
    original_value:        'original_value', // string: name of parameter holding the updated/edited value
    original_html:        "original_html", // string: name of parameter holding original_html value of the editable /* DEPRECATED in 2.2.0 */ use original_value instead.
    save_if_nothing_changed:    false,  // boolean: submit to function or server even if the user did not change anything
    on_blur:            "save", // string: "save" or null; what to do on blur; will be overridden if show_buttons is true
    cancel:                "", // string: if not empty, a jquery selector for elements that will not cause the editor to open even though they are clicked. E.g. if you have extra buttons inside editable fields

    // All callbacks will have this set to the DOM node of the editor that triggered the callback

    callback:            null, // function: function to be called when editing is complete; cancels ajax submission to the url param. Prototype: function(idOfEditor, enteredText, orinalHTMLContent, settingsParams, callbacks). The function needs to return the value that should be shown in the dom. Returning undefined means cancel and will restore the dom and trigger an error. callbacks is a dictionary with two functions didStartSaving and didEndSaving() that you can use to tell the inline editor that it should start and stop any saving animations it has configured. /* DEPRECATED in 2.1.0 */ Parameter idOfEditor, use $(this).attr('id') instead
    callback_skip_dom_reset: false, // boolean: set this to true if the callback should handle replacing the editor with the new value to show
    success:            null, // function: this function gets called if server responds with a success. Prototype: function(newEditorContentString)
    error:                null, // function: this function gets called if server responds with an error. Prototype: function(request)
    error_sink:            function(idOfEditor, errorString) {
        alert(errorString);
    }, // function: gets id of the editor and the error. Make sure the editor has an id, or it will just be undefined. If set to null, no error will be reported. /* DEPRECATED in 2.1.0 */ Parameter idOfEditor, use $(this).attr('id') instead
    preinit:            null, // function: this function gets called after a click on an editable element but before the editor opens. If you return false, the inline editor will not open. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate shouldOpenEditInPlace call instead
    postclose:            null, // function: this function gets called after the inline editor has closed and all values are updated. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate didCloseEditInPlace call instead
    delegate:            null // object: if it has methods with the name of the callbacks documented below in delegateExample these will be called. This means that you just need to impelment the callbacks you are interested in.
};

// Lifecycle events that the delegate can implement
// this will always be fixed to the delegate
var delegateExample = {
    // called while opening the editor.
    // return false to prevent editor from opening
    shouldOpenEditInPlace: function(aDOMNode, aSettingsDict, triggeringEvent) {
    },
    // return content to show in inplace editor
    willOpenEditInPlace: function(aDOMNode, aSettingsDict) {
    },
    didOpenEditInPlace: function(aDOMNode, aSettingsDict) {
    },

    // called while closing the editor
    // return false to prevent the editor from closing
    shouldCloseEditInPlace: function(aDOMNode, aSettingsDict, triggeringEvent) {
    },
    // return value will be shown during saving
    willCloseEditInPlace: function(aDOMNode, aSettingsDict) {
    },
    didCloseEditInPlace: function(aDOMNode, aSettingsDict) {
    },

    missingCommaErrorPreventer:''
};


function InlineEditor(settings, dom) {
    this.settings = settings;
    this.dom = dom;
    this.originalValue = null;
    this.didInsertDefaultText = false;
    this.shouldDelayReinit = false;
}
;

$.extend(InlineEditor.prototype, {

    init: function() {
        this.setDefaultTextIfNeccessary();
        this.connectOpeningEvents();
    },

    reinit: function() {
        if (this.shouldDelayReinit)
            return;

        this.triggerCallback(this.settings.postclose, /* DEPRECATED in 2.1.0 */ this.dom);
        this.triggerDelegateCall('didCloseEditInPlace');

        this.markEditorAsInactive();
        this.connectOpeningEvents();
    },

    setDefaultTextIfNeccessary: function() {
        if ('' !== this.dom.html())
            return;

        this.dom.html(this.settings.default_text);
        this.didInsertDefaultText = true;
    },

    connectOpeningEvents: function() {
        var that = this;
        this.dom
                .bind('mouseenter.editInPlace', function() {
            that.addHoverEffect();
        })
                .bind('mouseleave.editInPlace', function() {
            that.removeHoverEffect();
        })
                .bind('click.editInPlace', function(anEvent) {
            that.openEditor(anEvent);
        });
    },

    disconnectOpeningEvents: function() {
        // prevent re-opening the editor when it is already open
        this.dom.unbind('.textField');
    },

    addHoverEffect: function() {
        if (this.settings.hover_class)
            this.dom.addClass(this.settings.hover_class);
        else
            this.dom.css("background-color", this.settings.bg_over);
    },

    removeHoverEffect: function() {
        if (this.settings.hover_class)
            this.dom.removeClass(this.settings.hover_class);
        else
            this.dom.css("background-color", this.settings.bg_out);
    },

    openEditor: function(anEvent) {
        if (! this.shouldOpenEditor(anEvent))
            return;

        this.workAroundFirefoxBlurBug();
        this.disconnectOpeningEvents();
        this.removeHoverEffect();
        this.removeInsertedDefaultTextIfNeccessary();
        this.saveOriginalValue();
        this.markEditorAsActive();
        this.replaceContentWithEditor();
        this.connectOpeningEventsToEditor();
        this.triggerDelegateCall('didOpenEditInPlace');
    },

    shouldOpenEditor: function(anEvent) {
        if (this.isClickedObjectCancelled(anEvent.target))
            return false;

        if (false === this.triggerCallback(this.settings.preinit, /* DEPRECATED in 2.1.0 */ this.dom))
            return false;

        if (false === this.triggerDelegateCall('shouldOpenEditInPlace', true, anEvent))
            return false;

        return true;
    },

    removeInsertedDefaultTextIfNeccessary: function() {
        if (! this.didInsertDefaultText
                || this.dom.html() !== this.settings.default_text)
            return;

        this.dom.html('');
        this.didInsertDefaultText = false;
    },

    isClickedObjectCancelled: function(eventTarget) {
        if (! this.settings.cancel)
            return false;

        var eventTargetAndParents = $(eventTarget).parents().andSelf();
        var elementsMatchingCancelSelector = eventTargetAndParents.filter(this.settings.cancel);
        return 0 !== elementsMatchingCancelSelector.length;
    },

    saveOriginalValue: function() {
        if (this.settings.use_html)
            this.originalValue = this.dom.html();
        else
            this.originalValue = trim(this.dom.text());
    },

    restoreOriginalValue: function() {
        this.setClosedEditorContent(this.originalValue);
    },

    setClosedEditorContent: function(aValue) {
        if (this.settings.use_html)
            this.dom.html(aValue);
        else
            this.dom.text(aValue);
    },

    workAroundFirefoxBlurBug: function() {
        if (! $.browser.mozilla)
            return;

        // TODO: Opera seems to also have this bug....

        // Firefox will forget to send a blur event to an input element when another one is
        // created and selected programmatically. This means that if another inline editor is
        // opened, existing inline editors will _not_ close if they are configured to submit when blurred.
        // This is actually the first time I've written browser specific code for a browser different than IE! Wohoo!

        // Using parents() instead document as base to workaround the fact that in the unittests
        // the editor is not a child of window.document but of a document fragment
        this.dom.parents(':last').find('.editInPlace-active :input').blur();
    },

    replaceContentWithEditor: function() {
        var buttons_html = (this.settings.show_buttons) ? this.settings.save_button + ' ' + this.settings.cancel_button : '';
        var editorElement = this.createEditorElement(); // needs to happen before anything is replaced
        /* insert the new in place form after the element they click, then empty out the original element */
        this.dom.html('<form class="inplace_form" style="display: inline; margin: 0; padding: 0;"></form>')
                .find('form')
                .append(editorElement)
                .append(buttons_html);
    },

    createEditorElement: function() {
        if (-1 === $.inArray(this.settings.field_type, ['text', 'textarea', 'select']))
            throw "Unknown field_type <fnord>, supported are 'text', 'textarea' and 'select'";

        var editor = null;
        if ("select" === this.settings.field_type)
            editor = this.createSelectEditor();
        else if ("text" === this.settings.field_type)
            editor = $('<input type="text" ' + this.inputNameAndClass()
                    + ' size="' + this.settings.text_size + '" />');
        else if ("textarea" === this.settings.field_type)
            editor = $('<textarea ' + this.inputNameAndClass()
                    + ' rows="' + this.settings.textarea_rows + '" '
                    + ' cols="' + this.settings.textarea_cols + '" />');

        editor.val(this.triggerDelegateCall('willOpenEditInPlace', this.originalValue));
        return editor;
    },

    inputNameAndClass: function() {
        return ' name="inplace_value" class="inplace_field" ';
    },

    createSelectEditor: function() {
        var editor = $('<select' + this.inputNameAndClass() + '>'
                + '<option disabled="true" value="">' + this.settings.select_text + '</option>'
                + '</select>');

        var optionsArray = this.settings.select_options;
        if (! $.isArray(optionsArray))
            optionsArray = optionsArray.split(',');

        for (var i = 0; i < optionsArray.length; i++) {

            var currentTextAndValue = optionsArray[i];
            if (! $.isArray(currentTextAndValue))
                currentTextAndValue = currentTextAndValue.split(':');

            var value = trim(currentTextAndValue[1] || currentTextAndValue[0]);
            var text = trim(currentTextAndValue[0]);

            var selected = (value == this.originalValue) ? 'selected="selected" ' : '';
            var option = $('<option ' + selected + ' ></option>').val(value).text(text);
            editor.append(option);
        }
        return editor;

    },

    // REFACT: rename opening is not what it's about. Its about closing events really
    connectOpeningEventsToEditor: function() {
        var that = this;

        function cancelEditorAction(anEvent) {
            that.handleCancelEditor(anEvent);
            return false; // stop event bubbling
        }

        function saveEditorAction(anEvent) {
            that.handleSaveEditor(anEvent);
            return false; // stop event bubbling
        }

        var form = this.dom.find("form");

        form.find(".inplace_field").focus().select();
        form.find(".inplace_cancel").click(cancelEditorAction);
        form.find(".inplace_save").click(saveEditorAction);

        if (! this.settings.show_buttons) {
            // TODO: Firefox has a bug where blur is not reliably called when focus is lost
            //       (for example by another editor appearing)
            if ("save" === this.settings.on_blur)
                form.find(".inplace_field").blur(saveEditorAction);
            else
                form.find(".inplace_field").blur(cancelEditorAction);

            // workaround for firefox bug where it won't submit on enter if no button is shown
            if ($.browser.mozilla)
                this.bindSubmitOnEnterInInput();
        }

        form.keyup(function(anEvent) {
            // allow canceling with escape
            var escape = 27;
            if (escape === anEvent.which)
                return cancelEditorAction();
        });

        // workaround for webkit nightlies where they won't submit at all on enter
        // REFACT: find a way to just target the nightlies
        if ($.browser.safari)
            this.bindSubmitOnEnterInInput();


        form.submit(saveEditorAction);
    },

    bindSubmitOnEnterInInput: function() {
        if ('textarea' === this.settings.field_type)
            return; // can't enter newlines otherwise

        var that = this;
        this.dom.find(':input').keyup(function(event) {
            var enter = 13;
            if (enter === event.which)
                return that.dom.find('form').submit();
        });

    },

    handleCancelEditor: function(anEvent) {
        // REFACT: remove duplication between save and cancel
        if (false === this.triggerDelegateCall('shouldCloseEditInPlace', true, anEvent))
            return;

        var enteredText = this.dom.find(':input').val();
        enteredText = this.triggerDelegateCall('willCloseEditInPlace', enteredText);

        this.restoreOriginalValue();
        if (hasContent(enteredText)
                && ! this.isDisabledDefaultSelectChoice())
            this.setClosedEditorContent(enteredText);
        this.reinit();
    },

    handleSaveEditor: function(anEvent) {
        if (false === this.triggerDelegateCall('shouldCloseEditInPlace', true, anEvent))
            return;

        var enteredText = this.dom.find(':input').val();
        enteredText = this.triggerDelegateCall('willCloseEditInPlace', enteredText);

        if (this.isDisabledDefaultSelectChoice()
                || this.isUnchangedInput(enteredText)) {
            this.handleCancelEditor(anEvent);
            return;
        }

        if (this.didForgetRequiredText(enteredText)) {
            this.handleCancelEditor(anEvent);
            this.reportError("Error: You must enter a value to save this field");
            return;
        }

        this.showSaving(enteredText);

        if (this.settings.callback)
            this.handleSubmitToCallback(enteredText);
        else
            this.handleSubmitToServer(enteredText);
    },

    didForgetRequiredText: function(enteredText) {
        return this.settings.value_required
                && ("" === enteredText
                || undefined === enteredText
                || null === enteredText);
    },

    isDisabledDefaultSelectChoice: function() {
        return this.dom.find('option').eq(0).is(':selected:disabled');
    },

    isUnchangedInput: function(enteredText) {
        return ! this.settings.save_if_nothing_changed
                && this.originalValue === enteredText;
    },

    showSaving: function(enteredText) {
        if (this.settings.callback && this.settings.callback_skip_dom_reset)
            return;

        var savingMessage = enteredText;
        if (hasContent(this.settings.saving_text))
            savingMessage = this.settings.saving_text;
        if (hasContent(this.settings.saving_image))
        // REFACT: alt should be the configured saving message
            savingMessage = $('<img />').attr('src', this.settings.saving_image).attr('alt', savingMessage);
        this.dom.html(savingMessage);
    },

    handleSubmitToCallback: function(enteredText) {
        // REFACT: consider to encode enteredText and originalHTML before giving it to the callback
        this.enableOrDisableAnimationCallbacks(true, false);
        var newHTML = this.triggerCallback(this.settings.callback, /* DEPRECATED in 2.1.0 */ this.id(), enteredText, this.originalValue,
                this.settings.params, this.savingAnimationCallbacks());

        if (this.settings.callback_skip_dom_reset)
            ; // do nothing
        else if (undefined === newHTML) {
            // failure; put original back
            this.reportError("Error: Failed to save value: " + enteredText);
            this.restoreOriginalValue();
        }
        else
        // REFACT: use setClosedEditorContent
            this.dom.html(newHTML);

        if (this.didCallNoCallbacks()) {
            this.enableOrDisableAnimationCallbacks(false, false);
            this.reinit();
        }
    },

    handleSubmitToServer: function(enteredText) {
        var data = this.settings.update_value + '=' + encodeURIComponent(enteredText)
                + '&' + this.settings.element_id + '=' + this.dom.attr("id")
                + ((this.settings.params) ? '&' + this.settings.params : '')
                + '&' + this.settings.original_html + '=' + encodeURIComponent(this.originalValue) /* DEPRECATED in 2.2.0 */
                + '&' + this.settings.original_value + '=' + encodeURIComponent(this.originalValue);

        this.enableOrDisableAnimationCallbacks(true, false);
        this.didStartSaving();
        var that = this;
        $.ajax({
            url: that.settings.url,
            type: "POST",
            data: data,
            dataType: "html",
            complete: function(request) {
                that.didEndSaving();
            },
            success: function(html) {
                var new_text = html || that.settings.default_text;

                /* put the newly updated info into the original element */
                // FIXME: should be affected by the preferences switch
                that.dom.html(new_text);
                // REFACT: remove dom parameter, already in this, not documented, should be easy to remove
                // REFACT: callback should be able to override what gets put into the DOM
                that.triggerCallback(that.settings.success, html);
            },
            error: function(request) {
                that.dom.html(that.originalHTML); // REFACT: what about a restorePreEditingContent()
                if (that.settings.error)
                // REFACT: remove dom parameter, already in this, not documented, can remove without deprecation
                // REFACT: callback should be able to override what gets entered into the DOM
                    that.triggerCallback(that.settings.error, request);
                else
                    that.reportError("Failed to save value: " + request.responseText || 'Unspecified Error');
            }
        });
    },

    // Utilities .........................................................

    triggerCallback: function(aCallback /*, arguments */) {
        if (! aCallback)
            return; // callback wasn't specified after all

        var callbackArguments = Array.prototype.splice.call(arguments, 1);
        return aCallback.apply(this.dom[0], callbackArguments);
    },

    /// defaultReturnValue is only used if the delegate returns undefined
    triggerDelegateCall: function(aDelegateMethodName, defaultReturnValue, optionalEvent) {
        // REFACT: consider to trigger equivalent callbacks automatically via a mapping table?
        if (! this.settings.delegate
                || ! $.isFunction(this.settings.delegate[aDelegateMethodName]))
            return defaultReturnValue;

        var delegateReturnValue = this.settings.delegate[aDelegateMethodName](this.dom, this.settings, optionalEvent);
        return (undefined === delegateReturnValue)
                ? defaultReturnValue
                : delegateReturnValue;
    },

    reportError: function(anErrorString) {
        this.triggerCallback(this.settings.error_sink, /* DEPRECATED in 2.1.0 */ this.id(), anErrorString);
    },

    // REFACT: this method should go, callbacks should get the dom node itself as an argument
    id: function() {
        return this.dom.attr('id');
    },

    markEditorAsActive: function() {
        this.dom.addClass('editInPlace-active');
    },

    markEditorAsInactive: function() {
        this.dom.removeClass('editInPlace-active');
    },

    // REFACT: consider rename, doesn't deal with animation directly
    savingAnimationCallbacks: function() {
        var that = this;
        return {
            didStartSaving: function() {
                that.didStartSaving();
            },
            didEndSaving: function() {
                that.didEndSaving();
            }
        };
    },

    enableOrDisableAnimationCallbacks: function(shouldEnableStart, shouldEnableEnd) {
        this.didStartSaving.enabled = shouldEnableStart;
        this.didEndSaving.enabled = shouldEnableEnd;
    },

    didCallNoCallbacks: function() {
        return this.didStartSaving.enabled && ! this.didEndSaving.enabled;
    },

    assertCanCall: function(methodName) {
        if (! this[methodName].enabled)
            throw new Error('Cannot call ' + methodName + ' now. See documentation for details.');
    },

    didStartSaving: function() {
        this.assertCanCall('didStartSaving');
        this.shouldDelayReinit = true;
        this.enableOrDisableAnimationCallbacks(false, true);

        this.startSavingAnimation();
    },

    didEndSaving: function() {
        this.assertCanCall('didEndSaving');
        this.shouldDelayReinit = false;
        this.enableOrDisableAnimationCallbacks(false, false);
        this.reinit();

        this.stopSavingAnimation();
    },

    startSavingAnimation: function() {
        var that = this;
        this.dom
                .animate({ backgroundColor: this.settings.saving_animation_color }, 400)
                .animate({ backgroundColor: 'transparent'}, 400, 'swing', function() {
            // In the tests animations are turned off - i.e they happen instantaneously.
            // Hence we need to prevent this from becomming an unbounded recursion.
            setTimeout(function() {
                that.startSavingAnimation();
            }, 10);
        });
    },

    stopSavingAnimation: function() {
        this.dom
                .stop(true)
                .css({backgroundColor: ''});
    },

    missingCommaErrorPreventer:''
});


// Private helpers .......................................................

function assertMandatorySettingsArePresent(options) {
    // one of these needs to be non falsy
    if (options.url || options.callback)
        return;

    throw new Error("Need to set either url: or callback: option for the inline editor to work.");
}

/* preload the loading icon if it is configured */
function preloadImage(anImageURL) {
    if ('' === anImageURL)
        return;

    var loading_image = new Image();
    loading_image.src = anImageURL;
}

function trim(aString) {
    return aString
            .replace(/^\s+/, '')
            .replace(/\s+$/, '');
}

function hasContent(something) {
    if (undefined === something || null === something)
        return false;

    if (0 === something.length)
        return false;

    return true;
}

// -- end of jquery.editinplace.js copy hack


$.fn.AddKanbanCard = function(options) {

    var defaults = {
        card: null
    };
    var opts = $.extend(defaults, options);

    var self = $(this);
    var html = $('<div class="kanban_card {id:' + opts.card.id + '}"/>');

    //
    // Card Header
    //
    var header = $('<div class="kanban_card_header"/>');
    header.append($('<span class="grippy"/>'));

    var gravatars = $('<div class="kanban_card_gravatars"/>');
    $.each(opts.card.owners, function(i, owner_id) {
        var owner = User.findById(owner_id);
        gravatars.append('<img class="gravatar"  src="' + get_gravatar(owner, 30) + '" title="' + fullName(owner) + '"/>');
    })
    if (gravatars.children().size() == 0) {
        gravatars.append('<div class="gravatar unknown_gravatar">' + '?' + '</div>');
    }
    header.append(gravatars);

    html.append(header);


    //
    // Expand/Collapse Arrow and Title
    //
    {
        var titleBar = $('<div class="kanban_card_title"/>');
        var expandCollapseArrow = $('<div class="expand_collapse_arrow expand">Expand/Collapse</div>');
        expandCollapseArrow.click(function() {
            var arrowToggle = $(this);
            var parent = $(this).parent().parent();
            if (arrowToggle.hasClass("expand")) {
                parent.find(".kanban_card_body").show();
            } else {
                parent.find(".kanban_card_body").hide();
            }
            $(this).toggleClass("expand").toggleClass("collapse");
        });
        titleBar.append(expandCollapseArrow);
        var title = $('<div class="title"/>').text(opts.card.title);
        title.editInPlace({
            callback: function(notused, value, oldValue) {
            },
            field_type: 'textarea'

        })
        titleBar.append(title);
    }
    html.append(titleBar);

    //
    // Card Body
    //
    var body = $('<div class="kanban_card_body"/>').css("display", "none");
    {
        //
        // Tasks Tab
        //
        var tasks_tab_content = $('<div class="tasks"/>');
        $.each(Card.tasks(opts.card.id), function(i, task) {
            tasks_tab_content.append(makeTask(task));
        })

        // New Task Form
        var newTaskInput = $('<input class="kanban_card_new_task" value="<Add a new task>"/>');
        newTaskInput.clearOnFocus();

        var form = $('<form action="#"/>');
        form.append(newTaskInput);
        form.ajaxForm(function() {
            var value = newTaskInput.val();
            var task = Card.createTask(opts.card.id, value);
            form.before(makeTask(task));
            newTaskInput.val('');
        });
        var outer = $('<div/>');
        outer.append(tasks_tab_content);
        outer.append(form);

        body.append(outer);
    }
    tasks_tab_content.sortable({
        handle : '.grippy',
        connectWith: '.kanban_card_body .tasks',
        update : function () {
            var order = tasks_tab_content.sortable('serialize');
        }
    });

    html.append(body);
    self.append(html);


    //
    // Hover Actions
    //
    var hoverActive = false; //  A hack - the mouse-enter was getting triggered inside its drag event
    html.mouseenter(function() {
        if (!hoverActive) {
            var container = $(this).find('.kanban_card_header');
            var html = $('<div class="card_hover_actions" />');
            html.append('<div class="action edit" title="Card Details Page"/>');
            html.append('<div class="action delete" title="Delete this card"/>');
            html.append('<div class="action comments" title="Card Comments"/>');
            html.append('<div class="action comments" title="View this card in Jira"/>');
            container.append(html);
            hoverActive = true;
        }
    })
    html.mouseleave(function() {
        $(this).removeClass('kanban_card_hover');
        $(this).find('.card_hover_actions').remove();
        hoverActive = false;
    })


    //
    // PRIVATE METHODS
    //
    function fullName(user) {
        return user.firstName + " " + user.lastName;
    }

    function makeTask(task) {
        var html = $('<div class="kanban_card_task {id:"' + task.id + '}"/>');
        html.append($('<span class="grippy"/>'));
        html.append($('<span class="state"/>').addClass(classForImageState(task.state)));
        function imageForTaskOwner(task, i) {
            if (task.owners[i] != undefined) {
                var user = User.findById(task.owners[i], opts.users);
                return '<img src="' + get_gravatar(user, 18) + '"/>';
            } else {
                return '<div class="no_task_owner"/>';
            }
        }

        html.append($('<span class="owner"/>').html(imageForTaskOwner(task, 0)));
        html.append($('<span class="owner"/>').html(imageForTaskOwner(task, 1)));
        html.append('<div class="title"/>');
        html.find('.title').html(task.title).editInPlace({
            callback: function(unused, enteredText) {
                return enteredText;
            }
        });

        return html;
    }

    function get_gravatar(user, size) {
        var size = size || 80;
        return makeGravatarUrl(user.gravatarHash, size)
    }

    function makeGravatarUrl(hash, size) {
        return 'http://www.gravatar.com/avatar/' + hash + '.jpg?s=' + size;
    }

    function classForImageState(state) {
        switch (state) {
            case 1:
                return "task_state_started"
                break;
            case 2:
                return "task_state_completed"
                break;
            case 3:
                return "task_state_blocked"
                break;
            default:
                return "task_state_not_started"
        }
    }


}



