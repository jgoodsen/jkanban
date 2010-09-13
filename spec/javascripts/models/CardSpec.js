describe("The Card Model", function() {

    beforeEach(function() {
        loadSimpleProjectJsonFixtures();
    });


    describe("findById()", function() {

        it("should find aN existing card", function() {
            var card = Card.findById(100);
            expect(card).toBeTruthy();
            expect(card.id).toEqual(100);
        });

        it("should return undefined for an unexisting card", function() {
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

    describe("tasks()", function() {
        it("should return only the tasks assigned to this card", function() {
            expect(Card.tasks(100).length).toEqual(4);
            expect(Card.tasks(101).length).toEqual(4);
        });
        it("should return empty array if not tasks found", function() {
            expect(Card.tasks(-999).length).toEqual(0);
        });
    })

});