describe("User", function() {

  it("should respond to findById()", function() {
    var user = User.findById(10, Fixtures.simpleBoardConfig.users);
    expect(user.id).toEqual(10);
  })

})