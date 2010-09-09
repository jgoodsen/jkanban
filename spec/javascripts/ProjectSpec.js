
describe("Project", function() {
  var project;

  beforeEach(function() {
  });

  it("constructor", function() {
      expect(new Project(99).id).toEqual(99);
      expect(new Project(99).cards).toEqual([]);
  });

  xdescribe("function Cards()", function(){
      it("should make an ajax request to retrieve the cards", function() {
      })
  })

});