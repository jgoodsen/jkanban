describe("SwimLane", function(){


    it("Should add a swimlane div", function(){
        var board = $('#jasmine_content');
        board.AddSwimLane({
            swimlane: Fixtures.simpleBoardConfig.swimlanes[0]
        })
        expect(board.find(".swimlane").size()).toEqual(1);
    })

    it("Should add it's allocated cards", function(){
        var board = $('#jasmine_content');
        var config = Fixtures.simpleBoardConfig;
        spyOn($.fn, 'AddKanbanCard').andCallThrough();
        board.AddSwimLane({
            swimlane: config.swimlanes[0],
            cards: config.cards,
            swimlane_assignments: config.swimlane_assignments
        })
        expect($.fn.AddKanbanCard).toHaveBeenCalled();
    })

})