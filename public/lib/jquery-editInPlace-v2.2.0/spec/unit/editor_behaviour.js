// REFACT: consider to split into 'closed editor' and 'open editor'
describe 'editor behaviour'
  should_behave_like('shared setup')
  
  describe 'marker classes'
    
    it 'should set .editInPlace-active when activating editor'
      this.sandbox.should.not.have_class 'editInPlace-active'
      this.enableEditor().click().should.have_class 'editInPlace-active'
    end
    
    it 'should remove .editInPlace-active when editor finished submitting'
      this.openEditor()
      this.sandbox.should.have_class 'editInPlace-active'
      this.sandbox.find(':input').val('fnord').submit()
      this.sandbox.should.not.have_class 'editInPlace-active'
    end
    
    it 'should remove .editInPlace-active when cancelling the editor'
      this.openEditor().submit();
      this.sandbox.should.not.have_class 'editInPlace-active'
    end
    
    it 'should remove .editInPlace-active when the callback returns if no animation callbacks are used'
      this.edit({ callback: -{ return ''; } }, 'bar')
      this.sandbox.should.not.have_class 'editInPlace-active'
    end
    
    it 'should not remove .editInPlace-active if didStartSaving() is called before callback returns'
      var callbacks;
      function callback() {
        callbacks = arguments[4];
        callbacks.didStartSaving();
        return '';
      }
      this.edit({ callback:callback })
      this.sandbox.should.have_class 'editInPlace-active'
      callbacks.didEndSaving();
      this.sandbox.should.not.have_class 'editInPlace-active'
    end
    
    it 'should ignore animation callbacks after submit callback has returned'
      var callbacks;
      function callback(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
        callbacks = animationCallbacks;
        return '';
      }
      this.edit({ callback: callback })
      this.sandbox.should.not.have_class '.editInPlace-active'
      
      -{ callbacks.didStartSaving() }.should.throw_error /Cannot call/
      -{ callbacks.didEndSaving() }.should.throw_error /Cannot call/
    end
    
    it 'throws if calling didEndSaving() in the callback before didStartSaving() was called'
      var callbacks;
      function callback(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
        -{ animationCallbacks.didEndSaving() }.should.throw_error /Cannot call/
        return '';
      }
      this.edit({ callback: callback })
    end
    
    it 'should allow to call both callbacks before the callback returns'
      function callback(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
        animationCallbacks.didStartSaving();
        animationCallbacks.didEndSaving();
        return '';
      }
      this.edit({ callback: callback })
      // now the editor should again be bound
      this.sandbox.should.not.have_tag 'form'
      this.sandbox.should.have_event_handlers 'click'
    end
    
  end
  
  describe 'animations during save'
    
    it 'should animate during ajax save to server'
      var complete
      stub($, 'ajax').and_return(function(options) { complete = options.complete; })
      this.edit()
      
      this.sandbox.is(':animated').should.be true
      complete();
      this.sandbox.is(':animated').should.be false
    end
    
    it 'should animate when callbacks are called when submitting to callback'
      var complete
      function callback(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
        animationCallbacks.didStartSaving();
        complete = animationCallbacks.didEndSaving;
        return '';
      }
      this.edit({ callback: callback })
      
      this.sandbox.is(':animated').should.be true
      complete();
      this.sandbox.is(':animated').should.be false
    end
    
    it 'should not animate if callbacks are not called when submitting to callback'
      this.edit({ callback: function() { return ''; }})
      this.sandbox.is(':animated').should.be false
    end
    
  end
  
  describe 'submit to callback'
    
    it 'shoud call callback on submit'
      var sensor = false;
      this.edit({ callback: -{ sensor = true; return ''; }})
      sensor.should.be true
    end
    
    it 'will replace editor with its return value'
      this.edit({ callback: -{ return 'fnord' } })
      this.sandbox.should.have_text 'fnord'
    end
    
    it 'can return 0 from callback'
      this.edit({callback: -{ return 0; }})
      this.sandbox.should.have_text "0"
    end
    
    it 'can return empty string from callback'
      this.edit({callback: -{ return ''; }})
      this.sandbox.should.have_text ''
    end
    
    it 'can skip dom reset after callback'
      var sensor = false
      this.edit({ callback: -{ sensor = true }, callback_skip_dom_reset:true })
      sensor.should.be true
      this.sandbox.should.have_tag 'form'
    end
    
    it 'will not replace editor with its return value'
      this.edit({ callback: -{ return 'fnord' }, callback_skip_dom_reset:true  })
      this.sandbox.should.not.have_text 'fnord'
    end
    
    it 'can replace text from within callback'
      this.edit({ callback: -{ $(this).html('fnord') }, callback_skip_dom_reset:true  })
      this.sandbox.should.have_text 'fnord'
    end
    
  end
  
  it 'will ignore multiple attempts to add an inline editor'
    this.numberOfHandlers = function() {
      var handlers = this.sandbox.data('events');
      if ( ! handlers)
        return 0;
      var count = 0;
      for (var key in handlers.click)
        count++;
      return count;
    }
    this.numberOfHandlers().should.be 0
    this.enableEditor()
    this.numberOfHandlers().should.be 1
    this.enableEditor()
    this.numberOfHandlers().should.be 1
  end
  
  it 'will not restore ancient view content when escape is triggered after the editor has closed'
    this.edit({}, 'fnord')
    this.sandbox.should.have_text 'fnord'
    // try to get the handler to fire even if it shouldn't
    var escape = 27
    $(document).trigger({type:'keyup', which:escape})
    this.sandbox.trigger({type:'keyup', which:escape})
    this.sandbox.should.have_text 'fnord'
  end
  
  
end


shared_behaviors_for 'open editor'
  
  should_behave_like('shared setup')
  
  before_each
    // change additionalOptions to make the sub-editors open their respective widgets
    // this.additionalOptions = { foo: bar }
    
    if ( ! ('additionalOptions' in this))
      throw new Error('You need to assign this.additionalOptions.type to a valid editor type when you include the shared behaviour "open editor"')
    
    var originalOpen = this.openEditor;
    stub(this, 'openEditor').and_return(function(options) {
      options = $.extend({}, this.additionalOptions, options)
      return originalOpen.call(this, options)
    })
  end
  
  it 'should restore original content when canceled out of'
    this.sandbox.text('fnord')
    this.openEditor().submit()
    this.sandbox.should.have_text 'fnord'
  end
  
  it 'should present an empty editor if the default text was entered by the editor itself'
    this.sandbox = $('<p>')
    this.enableEditor({ default_text: 'fnord' })
    this.sandbox.should.have_text 'fnord'
    this.sandbox.click().find(':input').should.have_value ''
    // also the second time
    this.sandbox.find(':input').submit()
    this.sandbox.click().find(':input').should.have_value ''
    // but not when it was changed in the meantime
    this.sandbox.find(':input').submit()
    this.sandbox.text('fnord')
    this.sandbox.click().find(':input').should.have_value 'fnord'
  end
  
  it 'should cancel when submitted no changes where made'
    $.should.not.receive 'ajax'
    this.openEditor().submit()
    this.sandbox.should.not.have_tag 'form'
  end
  
  it 'should have "inplace_name" as name and "inplace_field" as class'
    var input = this.openEditor()
    input.should.have_attr 'name', 'inplace_value'
    input.should.have_class 'inplace_field'
  end
  
  it 'should cancel when escape is pressed while focus is in the editor'
    var escape = 27
    this.openEditor().trigger({ type:'keyup', which:escape })
    this.sandbox.should.not.have_tag 'form'
  end
  
  it 'can submit enterd value to function when submitting '
    var sensor = null
    var options = {
      callback: function(id, enteredText) { return sensor = enteredText; }
    }
    this.edit(options, 'fnord')
    sensor.should.equal 'fnord'
  end
  
  it 'should not remove content on opening editor if it is identical to the default_text '
    this.sandbox = $('<p>fnord</p>')
    this.openEditor({ default_text:'fnord' }).should.have_value 'fnord'
  end
  
end

shared_behaviors_for 'open editor with arbitrary text input'
  
  it 'should escape content when inserting text into the editor'
    var strangeCharacters = '&"<>'
    this.sandbox.text(strangeCharacters);
    this.openEditor().should.have_value strangeCharacters
  end
  
  it 'should trim content when inserting text into the editor'
    this.sandbox.text(' fnord ')
    this.openEditor().should.have_value 'fnord'
  end
  
end

shared_behaviors_for 'open editor submitting on enter'
  
  it 'should cancel when enter is pressed if no changes where made'
    $.should.not.receive 'ajax'
    var enter = 13
    this.openEditor().trigger({ type: 'keyup', which:enter })
    this.sandbox.should.not.have_tag 'form'
  end
  
end

describe 'text'
  should_behave_like('open editor')
  should_behave_like('open editor with arbitrary text input')
  should_behave_like('open editor submitting on enter')
  
  before
    this.additionalOptions = { field_type: 'text' }
  end
  
  it 'should be the configured type'
    this.openEditor().should.have_attr 'type', this.additionalOptions.field_type
  end
  
  
end

describe 'textarea'
  should_behave_like('open editor')
  should_behave_like('open editor with arbitrary text input')
  
  before
    this.additionalOptions = { field_type: 'textarea' }
  end
  
  it 'should be the configured type'
    this.openEditor().should.be_tag this.additionalOptions.field_type
  end
  
  it 'should not submit on enter'
  debugger
    var enter = 13
    this.openEditor().trigger({type:'keyup', which:enter})
    this.sandbox.should.have_tag 'form'
  end
  
end

describe 'select'
  should_behave_like('open editor')
  should_behave_like('open editor submitting on enter')
  
  before
    this.additionalOptions = { field_type: 'select', select_options: 'fnord'}
  end
  
  it 'should be the configured type'
  this.openEditor().should.be_tag this.additionalOptions.field_type
  end
  
end
