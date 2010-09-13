describe("The Task Model", function() {

    describe("last()", function() {
        it("should return the last element in the array", function() {
            var last = Task.last();
            expect(last.id).toEqual(612);
        })
    })
    describe("create()", function() {
        it("should save and return the new task", function(){
            var task = Task.create({card_id:103, title: "New Task"});
            expect(task.card_id).toEqual(103);
            expect(task.title).toEqual("New Task");
            expect(Task.last()).toEqual(task);
        })
    });

});