describe("get_avatar", function(){

    beforeEach(function() {
        loadSimpleProjectJsonFixtures();
    });

    it("should calculate the MD5", function() {
        expect(MD5("johndoe@radtrack.com")).toEqual("cdba0cfbb823f0086fcab9bbadd45ce4");
    });

    it("should stash the card id in it's metadata", function() {
        var card = ProjectFixtures.simpleProjectJson.cards[0];
        var root = $('#jasmine_content');
        root.AddKanbanCard({card: card});
        var kanbanCard = root.find(".kanban_card");
        expect(kanbanCard).toBeTruthy();
        var metadata = kanbanCard.metadata();
        expect(metadata.id).toEqual(card.id);

    })
})