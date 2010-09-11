describe 'default settings'
  
  should_behave_like('shared setup')
  
  it 'should throw if neither url nor callback option is set'
    var that = this;
    -{ that.sandbox.editInPlace() }.should.throw_error Error, "Need to set either url: or callback: option for the inline editor to work."
  end
  
  it 'can convert tag to editor'
    this.openEditor()
    this.sandbox.should.have_tag 'input'
  end
  
  it 'leaves out buttons by default'
    this.openEditor()
    this.sandbox.should.not.have_tags 'button'
  end
  
  it 'uses text as default field type'
    this.openEditor()
    this.sandbox.should.have_tag 'input[type="text"]'
  end
  
  it 'will hover to yellow'
    this.enableEditor().mouseover().css('background-color').should.equal 'rgb(255, 255, 204)'
    this.sandbox.mouseout().css('background-color').should.equal 'transparent'
  end
  
  it 'should show "click here to add text" if element is empty'
    this.sandbox = $('<p>');
    this.enableEditor().should.have_text "(Click here to add text)"
  end
  
  it 'will size textareas 25x10 by default'
    var textarea = this.openEditor({field_type:'textarea'})
    textarea.attr('cols').should.be 25
    textarea.attr('rows').should.be 10
  end
  
  describe 'ajax submissions'
    
    before_each
      var that = this;
      that.url = undefined;
      stub($, 'ajax').and_return(function(options){ that.url = options.data; })
    end
    
    it 'will submit id of original element as element_id'
      this.sandbox.attr('id', 'fnord')
      this.edit()
      this.url.should.include 'element_id=fnord'
    end
    
    it 'will submit content of editor as update_value'
      this.edit({}, 'fnord')
      this.url.should.include 'update_value=fnord'
    end
    
    it 'will submit original html with key original_html'
      this.sandbox.text('fnord')
      this.edit({}, 'foo')
      this.url.should.include 'original_html=fnord'
    end
    
    it 'will url encode entered text'
      this.edit({}, '%&=/<>')
      this.url.should.include 'update_value=%25%26%3D%2F%3C%3E'
    end
    
    it 'will url encode original html correctly'
      this.sandbox.html('<p onclick="\"%&=/<>\"">')
      this.edit({use_html:true})
      this.url.should.include 'original_html=%3Cp%20onclick%3D%22%22%20%25%26%3D%22%2F%26lt%3B%22%3E%22%22%26gt%3B%3C%2Fp%3E'
    end
    
    it 'should not loose the param option on the second submit'
      var editor = this.openEditor({params: 'foo=bar'});
      this.edit()
      this.url.should.include 'foo=bar'
      editor.click().find(':input').val(23).submit()
      this.url.should.include 'foo=bar'
    end
    
    it 'will submit on blur'
      $.should.receive 'ajax'
      this.openEditor().val('fnord').blur()
    end
    
  end
  
  it 'should not trigger submit if nothing was changed'
    $.should.not.receive 'ajax'
    this.openEditor().submit()
  end
  
  it 'should not think that it has placed the default text in the editor if its content is changed from somewhere else'
    this.sandbox = $('<p></p>')
    this.enableEditor().text('fnord')
    this.sandbox.click().find(':input').val().should.equal 'fnord'
  end
  
  describe 'editor value interaction should use .text() to'
    
    before_each
      this.sandbox.html('fno<span>rd</span>')
    end
    
    it 'extract value from editor by default'
      this.openEditor().val().should.be 'fnord'
    end
    
    it 'restore content after cancel'
      this.openEditor().submit()
      // cancel editor
      this.sandbox.should.have_event_handlers 'click'
      this.sandbox.should.not.have_tag 'span'
    end
    
    it 'send to callback as third argument'
      var thirdArgument
      var options = {callback: -{ thirdArgument = arguments[2]; return ''; }}
      this.edit(options)
      thirdArgument.should.equal 'fnord'
    end
    
    it 'restore editor DOM after failed callback call'
      this.edit({callback: -{}, error_sink: -{}})
      this.sandbox.should.not.have_tag 'span'
    end
    
    it 'send to server via ajax-request'
      var data
      stub($, 'ajax').and_return(function(options) { data = options.data; })
      this.edit()
      data.should.match /original_value=fnord/
    end
    
  end
  
end
