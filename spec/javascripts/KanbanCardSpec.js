describe("get_avatar", function(){
  it("should calculate the MD5", function() {
    expect(MD5("johndoe@radtrack.com")).toEqual("cdba0cfbb823f0086fcab9bbadd45ce4");
  })
})