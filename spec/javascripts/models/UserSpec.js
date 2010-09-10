describe("User", function() {

  it("should respond to findById()", function() {
    var user = User.findById(10, BoardFixtures.simpleBoardConfig.projectJson.users);
    expect(user.id).toEqual(10);
  })

})