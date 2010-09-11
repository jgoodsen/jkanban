describe 'callbacks'
  
  should_behave_like('shared setup')
  
  it 'shoud call preinit callback on click'
    var sensor = false
    var originalText = this.sandbox.text()
    this.sandbox.text().should.be originalText
    this.openEditor({
      preinit: function(domNode){ sensor = domNode.clone(true); return ''; },
    })
    sensor.text().should.be originalText
  end
  
  it 'should not open editor if preinit returns false'
    this.openEditor({ preinit: -{ return false; }})
    this.sandbox.should.not.have_tag ':input'
  end
  
  it 'should open the editor if preinit returns undefined (i.e. nothing)'
    this.openEditor({ preinit: -{}})
    this.sandbox.should.have_tag ':input'
  end
  
  it 'should not call preinit if element is cancelled'
    var sensor = 'not called'
    this.openEditor({ cancel: "p", preinit: -{sensor = 'preinit'}})
    sensor.should.be 'not called'
  end
  
  it 'should call postclose after editor is closed'
    var sensor
    var options = { postclose: function(domNode) {
      sensor = domNode.clone()
    }}
    this.edit(options, 'fnord')
    sensor.text().should.equal "fnord"
    sensor.children().should.be_empty
  end
  
  it 'should send postclose callback after cancel'
    var sensor
    this.openEditor({ postclose: function(domNode) {
      sensor = domNode.clone()
    }})
    this.sandbox.click().find(':input').blur()
    sensor.text().should.equal "Some text"
    sensor.children().should.be_empty
  end
  
  describe 'uses dom element of editor as this for callbacks'
    
    before
      this.sensed = undefined;
      var that = this;
      this.sensor = function sensor(){ that.sensed = this; return ''; }
    end
    
    after_each
      this.sensed.should.be this.sandbox[0]
    end
    
    it 'callback'
      this.edit({ callback: this.sensor })
    end
    
    it 'success'
      var serverSuccessCallback;
      stub($, 'ajax').and_return(function(options) { serverSuccessCallback = options.success; })
      this.edit({ success: this.sensor })
      serverSuccessCallback('fnord')
    end
    
    it 'error'
      var serverErrorCallback;
      stub($, 'ajax').and_return(function(options) { serverErrorCallback = options.error; })
      this.edit({ error: this.sensor })
      serverErrorCallback()
    end
    
    it 'error_sink'
      this.edit({ error_sink: this.sensor, callback: -{} /* triggers error */ })
    end
    
    it 'preinit'
      this.edit({ preinit: this.sensor })
    end
    
    it 'postclose'
      this.edit({ postclose: this.sensor })
    end
    
  end
  
  describe 'lifecycle delegate callbacks'
    // TODO: check for all editor types, especially select fields
    // ideally, all callback tests should run with all editor types
    // This could be a fertile ground for the should_behave_like directive,
    // and a good call to split this into multiple files
    
    before_each
      this.sensor = {}
      var that = this;
      var originalEnableEditor = this.enableEditor
      stub(this, 'enableEditor').and_return(function(optionalSettings) {
        return originalEnableEditor.call(that, $.extend({ delegate: that.sensor }, optionalSettings))
      })
    end
    
    describe 'open'
      it 'should not open editor if shouldOpenEditInPlace returns false'
        this.sensor.should.receive_stub 'shouldOpenEditInPlace', false
        this.openEditor()
        this.sandbox.should.not.have_tag 'form'
      end
    
      it 'shouldOpenEditInPlace should get the click event as parameter'
        var event;
        this.sensor.should.receive_stub 'shouldOpenEditInPlace', -{ event = arguments[2] }
        this.openEditor()
        event.should.have_property 'type', 'click'
      end
            
      it 'should use return value of willOpenEditInPlace as initial value for editor'
        this.sensor.should.receive_stub 'willOpenEditInPlace', -{ return 'fnord' }
        this.openEditor().should.have_value 'fnord'
      end
    
      it 'should use return value of willOpenEditInPlace even if its falsy'
        this.sensor.should.receive_stub 'willOpenEditInPlace', ''
        this.openEditor().should.have_value ''
      end
      
      // TODO: willOpenEditInPlace is also called for select fields
      
      it 'should use original value if willOpenEditInPlace returns undefined'
        this.sandbox.text('fnord')
        this.sensor.should.receive_stub 'willOpenEditInPlace', -{}
        this.openEditor().should.have_value 'fnord'
      end
    
      it 'should call didOpenEditor once the editor is open'
        this.sensor.stub('willOpenEditInPlace').and_return('foo')
        this.sensor.should.receive_stub 'didOpenEditInPlace', function(dom) { $(dom).find(':input').val('fnord') }
        this.openEditor().should.have_value 'fnord'
      end
    end
    
    describe 'close'
    
      it 'shouldCloseEditInPlace should be able to cancel closing the editor'
        this.sensor.should.receive_stub 'shouldCloseEditInPlace', false
        this.edit('fnord').should.have_tag ':input'
      end
      
      it 'shouldCloseEditInPlace can cancel cancelling the editor'
        this.sensor.should.receive_stub 'shouldCloseEditInPlace', false
        this.openEditor({ on_blur:'cancel' }).blur() // no change == cancel
        this.sandbox.should.have_tag ':input'
      end
      
      // TODO: consider a test that the shouldCloseEditor is not called more than once?
      
      it 'shouldCloseEditInPlace should get the triggering event as parameter'
        var event
        this.sensor.should.receive_stub 'shouldCloseEditInPlace', -{ event = arguments[2] }
        this.edit()
        event.should.have_property 'type', 'submit'
      end
      
      it 'shouldCloseEditInPlace should get the triggering event as parameter on cancel'
        var event
        this.sensor.should.receive_stub 'shouldCloseEditInPlace', -{ event = arguments[2] }
        this.openEditor({ on_blur: 'cancel' }).blur()
        event.should.have_property 'type', 'blur'
      end
      
      it 'willCloseEditInPlace return value can override commit value'
        this.sensor.should.receive_stub 'willCloseEditInPlace', 'fnord'
        var committedText
        stub($, 'ajax').and_return(function(options) {
          options.data.should.include 'fnord'
        })
        this.edit({}, 'foo')
      end
      
      it "willCloseEditInPlace's return value will be shown during saving"
        this.sensor.should.receive_stub 'willCloseEditInPlace', 'fnord'
        stub($, 'ajax')
        this.edit({}, 'foo')
        this.sandbox.should.have_text('fnord')
      end
      
      it 'didCloseEditInPlace will be called after the editor is closed'
        function sensor(dom) {
          dom.should.not.have_tag 'form'
        }
        this.sensor.should.receive_stub 'didCloseEditInPlace', sensor
        this.edit()
      end
      
      it 'didCloseEditInPlace can change dom to be displayed after the editor closes'
        this.sensor.should.receive_stub 'didCloseEditInPlace', function(dom){ $(dom).text('fnord') }
        this.edit()
        this.sandbox.should.have_text 'fnord'
      end
      
    end
  end
  
end
