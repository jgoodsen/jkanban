describe("User", function() {

    beforeEach(function() {
        loadSimpleProjectJsonFixtures();
    });

    it("should respond to findById()", function() {
        var user = User.findById(10);
        expect(user.id).toEqual(10);
    })

    it("all()", function() {
        var user = User.findById(10);
        expect(user.id).toEqual(10);
    })

});
