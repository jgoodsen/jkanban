JSpec.addMatchers({
  
  be_tag: "jQuery(actual).is(expected) === true",
  
  receive_stub: {defer: true, match: function(actual, method, returnValue, times) {
    JSpec.stub(actual, method).and_return(returnValue)
    var proxy = new JSpec.ProxyAssertion(actual, method, times, this.negate)
    JSpec.currentSpec.assertions.push(proxy)
    return proxy
  }}
  
})
