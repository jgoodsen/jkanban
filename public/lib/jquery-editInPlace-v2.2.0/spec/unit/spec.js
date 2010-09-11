describe 'jquery.editinplace'
  should_behave_like('shared setup')
  
  describe 'custom settings'
    
    it 'will show text during saving to server'
      stub($, 'ajax')
      this.edit({saving_text: 'Saving...'})
      this.sandbox.should.have_text "Saving..."
    end
    
    it 'should add params as additional parameters to post-url'
      var url
      stub($, 'ajax').and_return(function(options) { url = options.data; })
      this.edit({ params: 'foo=bar'})
      url.should.include 'foo=bar'
    end
    
    it 'can edit default text shown in empty editors'
      this.sandbox = $('<p>')
      this.enableEditor({ default_text: 'fnord' }).should.have_text 'fnord'
    end
    
    it 'should show an empty editor even if default_text was shown in the element'
      this.sandbox = $('<p>')
      this.enableEditor({ default_text: 'fnord' }).click().find(':input').should.have_text ''
    end
    
    it 'can show as textarea with specified rows and cols'
      var textarea = this.openEditor({
        field_type:'textarea',
        textarea_rows:23,
        textarea_cols:42
      })
      
      textarea.should.have_attr 'rows', 23
      textarea.should.have_attr 'cols', 42
    end
    
    it 'can show as input with specified size'
      var input = this.openEditor({ 
        field_type: 'text',
        text_size: '23'
      })
      
      input.should.have_attr 'size', 23
    end
    
    describe 'select fields'
      
      before
        this.selectOptions = function(overideOptions) {
          return $.extend({
            field_type:'select',
            select_text:'select_text',
            select_options:'first,second,third'
          }, overideOptions)
        }
        this.editorOptions = function(settings) {
          // get() makes the assertions output the dom instead of the last selector if they fail...
          return this.openEditor(this.selectOptions(settings)).find('option').get()
        }
      end
      
      it 'should show popup with custom values'
        var options = this.editorOptions({ select_options:'foo,bar' })
        options.should.have_length 3
        options[1].should.have_text 'foo'
        options[1].should.have_value 'foo'
        options[2].should.have_text 'bar'
        options[2].should.have_value 'bar'
      end
      
      it 'should have default value of "" for default value'
        var options = this.editorOptions({ select_text:'fnord' })
        options[0].should.have_text 'fnord'
        options[0].should.have_value ''
      end
      
      it 'should select item in popup which matches initial text'
        this.sandbox = $('<p>text</p>')
        var options = this.editorOptions({ select_options:'foo,text,bar' })
        options.should.have_length 4
        options[2].should.be_selected
      end
      
      it 'should allow select_options to specify different value and text as text:value'
        var options = this.editorOptions({ select_options:'text:value' })
        options[1].should.have_value 'value'
        options[1].should.have_text 'text'
      end
      
      it 'should not show spaces in popup specification in dom'
        var options = this.editorOptions({ select_options:'foo, bar, baz' })
        options.should.have_length 4
        options[2].should.have_text 'bar'
        options[2].should.have_value 'bar'
      end
      
      it 'should allow an array of strings for select values'
        var options = this.editorOptions({ select_options:['foo', 'bar'] })
        options.should.have_length 3
        options[1].should.have_text 'foo'
        options[1].should.have_value 'foo'
      end
      
      it 'should allow array of array of strings to specify selected value and text as ["text", "value"]'
        var options = this.editorOptions({ select_options:[['text', 'value']] })
        options.should.have_length 2
        options[1].should.have_text 'text'
        options[1].should.have_value 'value'
      end
      
      it 'should disable default choice in select'
        var options = this.editorOptions()
        options[0].should.be_disabled
      end
      
      it 'does not submit disabled default choice in select'
        $.should.not.receive 'ajax'
        this.edit(this.selectOptions({
          callback: function(unused, input) { return input; }
        }), '')
        this.sandbox.should.have_text "Some text"
      end
    
    end
    
    it 'should throw if unknown field_type is chosen'
      var _this = this;
      -{ _this.openEditor({ field_type: 'fnord' }) }.should.throw_error /Unknown field_type <fnord>/
    end
    
    it 'can set hover_class parameter to override directly setting colors'
      this.enableEditor({ hover_class: 'fnord'})
      this.sandbox.should.not.have_class 'fnord'
      this.sandbox.mouseenter().should.have_class 'fnord'
      this.sandbox.mouseleave().should.not.have_class 'fnord'
    end
    
    it 'should still commit if commit_if_nothing_was_changed is specified'
      $.should.receive 'ajax', 'once'
      this.openEditor({save_if_nothing_changed:true}).submit()
    end
    
    describe 'can override error_sink to get errors as callbacks'
    
      it 'can get empty value error'
        var sensor = null;
        var options = {
          value_required: true,
          error_sink: function(id, error){ sensor = error; }
        }
        this.edit(options, '')
        sensor.should.match "Error: You must enter a value to save this field"
      end
      
      it 'can get empty return value from callback error'
        var sensor = null;
        var options = {
          callback: function(){},
          error_sink: function(id, error) { sensor = error; }
        }
        this.edit(options, 'fnord')
        sensor.should.match "Error: Failed to save value: fnord"
      end
      
      it 'can get xhr submit errors'
        var sensor = null;
        stub($, 'ajax').and_return(function(options) { options.error({ responseText:'fnord' }); })
        var options = { error_sink: function(id, error) { sensor = error; } }
        this.edit(options, 'foo')
        sensor.should.match "fnord"
      end
    end
    
    it 'should not reset background color on submit if hover_class is specified'
      this.edit({ hover_class: 'fnord' })
      this.sandbox.css('background-color').should.be_within ['', 'inherit', 'transparent']
    end
    
    it 'should not reset background color on cancel if hover_class is specified'
      this.openEditor({hover_class: 'fnord'}).submit()
      this.sandbox.css('background-color').should.be_within ['', 'inherit', 'transparent']
    end
    
    it "should respect saving_animation_color (doesn't yet really test that the target color is reached though)"
      stub($, 'ajax').and_return($)
      this.edit({ saving_animation_color: '#002342' })
      this.sandbox.css('backgroundColor').should.be 'rgb(255, 255, 255)'
      tick(200) // first animation not yet finished
      this.sandbox.css('backgroundColor').should.not.be 'rgb(255, 255, 255)'
      this.sandbox.is(':animated').should.be true
    end
    
    describe 'cancelling elements'
    
      it 'should not open the editor if the clicked element is a cancel element'
        var child = $('<em>is bold</em>')
        this.sandbox.append(child)
        this.enableEditor({ cancel: "em"})
        child.click()
        this.sandbox.should.not.have_tag ':input'
      end
    
      it 'should not open the editor if the clicked element is child of cancelled element'
        var child = $('<em>is bold</em>')
        this.sandbox.append(child)
        this.enableEditor({ cancel: "p"})
        child.click()
        this.sandbox.should.not.have_tag ':input'
      end
    
      it 'should open the editor if cancel is empty'
        this.openEditor({ cancel: ""})
        this.sandbox.should.have_tag ':input'
      end
    
      it 'should not open the editor even clicking on one of two cancel elements'
        this.openEditor({ cancel: "a, p"})
        this.sandbox.should.not.have_tag ':input'
      end
      
    end
    
    describe 'editor value interaction can use .html() to'
      
      before_each
        this.sandbox.html('fno<span>rd</span>')
      end
      
      it 'set value of editor'
        this.openEditor({use_html:true}).should.have_value 'fno<span>rd</span>'
      end
      
      it 'select default options for select field'
        this.openEditor({use_html:true, field_type:'select', select_options:['foo:fnord', 'bar:fno<span>rd</span>']})
        this.sandbox.find(':input').should.have_value 'fno<span>rd</span>'
      end
      
      it 'determines if nothing changed'
        $.should.receive('ajax')
        this.edit({use_html:true}, 'fnord')
      end
      
    end
    
    describe 'can map legacy preference names to new preference names'
      
    end
    
  end
  
  
end

__END__
