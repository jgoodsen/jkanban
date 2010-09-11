shared_behaviors_for 'shared setup'

  before
    // REFACT: use JSpec.context = { foo : 'bar' } for this
    // helpers to simplify writing the tests
    this.enableEditor = function(options) {
      // need either callback or url or the inline editor will throw
      if ( ! options || ! ('callback' in options))
        options = $.extend({url:'nonexistant_url'}, options);
      return this.sandbox.editInPlace(options);
    }
    
    this.openEditor = function(options) {
      return this.enableEditor(options).click().find(':input');
    }
    
    this.edit = function(options, value) {
      value = (undefined === value) ? 'text that is different to what was entered before' : value;
      this.openEditor(options).val(value).submit();
      return this.sandbox;
    }
    
  end
  
  before_each
    // If this is missing each request will grab the current page (no url specified)
    // and on inserting it, that will whipe the test results. (I don't quite understand why)
    mock_request().and_return('fnord')
    
    // REFACT: use JSpec.context = { foo : 'bar' } for this
    this.sandbox = $('<p>Some text</p>')
    // Workaround to jquery-ui 1.7.3 bug that it can't reliably deal with document fragments not having a color at their root element
    this.sandbox.parent().css({ backgroundColor:'transparent' })
  end
  
end