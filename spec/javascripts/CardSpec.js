describe("The Card Model", function(){

    describe("create()", function() {

        it("should save the new object into the local datastore", function(){
            var id = 999;
            expect(Card.findById(id)).toBeFalsy();
            Card.create(id);
            expect(Card.findById(id)).toBeTruthy();
        })

    })

    describe("array assumptions", function(){
            
        it("should support the map() function", function(){
            var original = [1,2,3,4,5,6,7,8,9,10];
            var results = original.map(function(element){return element*2;});
            expect(results).toEqual([2,4,6,8,10,12,14,16,18,20]);
        });

    })
})