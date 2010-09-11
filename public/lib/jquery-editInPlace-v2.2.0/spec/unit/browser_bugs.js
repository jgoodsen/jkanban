describe 'browser specific behaviour'

  should_behave_like('shared setup')

  it "firefox does send other in place editors blur event (as the browser doesn't do it)"
    // can't return early out of an eval context....
    // consider to change jspec so these are real functions that are called like regular functions
    if ($.browser.mozilla) {
      // cold need to encapsulate in div
      this.sandbox = $('<div><p/><p/></div>')
      this.sandbox.find('p').editInPlace({url:'fnord'})
      // open both editors at the same time
      this.sandbox.find('p:first').click()
      this.sandbox.find('p:last').click()
      this.sandbox.find(':input').should.have_length 1
      this.sandbox.should.have_tag 'p:last :input'
    }
  end
  
  it 'webkit nightlies should commit on enter'
    if ($.browser.safari) {
      var enter = 13
      this.openEditor().val('fnord').trigger({ type:'keyup', which:enter})
      this.sandbox.should.not.have_tag 'form'
      this.sandbox.should.have_text 'fnord'
    }
  end
  
end
