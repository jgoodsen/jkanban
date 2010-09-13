describe("The Card Model", function() {

    beforeEach(function() {
        Card.allCards = ProjectFixtures.simpleProjectJson.cards;
    });


    describe("findById", function() {

        it("Card.findById() should find aN existing card", function() {
            var card = Card.findById(100);
            expect(card).toBeTruthy();
            expect(card.id).toEqual(100);
        });

        it("Card.findById() should return undefined for an unexisting card", function() {
            var card = Card.findById(0);
            expect(card).toEqual(undefined);
        });

    });

    describe("Card.all()", function() {

        it("should return all cards in the collection", function() {
            var allCards = Card.all();
            expect(allCards.length).toEqual(7);
        });

    });

    describe("Card.last()", function() {

        it("should return the last card in the collection", function() {
            var lastCard = Card.last();
            expect(lastCard.id).toEqual(106);
        });

    });

    describe("nextId()", function() {
        it("should return the next id", function() {
            expect(Card.nextId()).toEqual(107);
        });
    });

    describe("create()", function() {

        it("should save the new card and return it", function() {
            var card = Card.create();
            expect(card).toBeTruthy();
            expect(card.id).toEqual(107);
            var c = Card.findById(107);
            expect(c.id).toEqual(107);
        });
    });

    xdescribe("array assumptions", function() {

        it("should support the map() function", function() {
            var original = [1,2,3,4,5,6,7,8,9,10];
            var results = original.map(function(element) {
                return element * 2;
            });
            expect(results).toEqual([2,4,6,8,10,12,14,16,18,20]);
        });

    });

});