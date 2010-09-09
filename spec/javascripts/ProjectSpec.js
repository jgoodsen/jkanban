
describe("Project", function() {
  var project;
  var song;

  beforeEach(function() {
  });

  it("should be able to play a Song", function() {
      var project = new Project(99);
      expect(project.id).toEqual(99);
      replaceNextXhr({id:22});
  });

});