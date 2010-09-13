describe("SwimLane", function(){

    beforeEach(function() {
        loadSimpleProjectJsonFixtures();
    });


    it("Should add a swimlane div", function(){
        var board = $('#jasmine_content');
        board.AddSwimLane({
            swimlane: BoardFixtures.simpleBoardConfig.swimlanes[0],
            swimlaneAssignments: BoardFixtures.simpleBoardConfig.swimlaneAssignments
        })
        expect(board.find(".kanban_swimlane").size()).toEqual(1);
    })

    it("Should add it's allocated cards", function(){
        var board = $('#jasmine_content');
        var config = BoardFixtures.simpleBoardConfig;
        spyOn($.fn, 'AddKanbanCard');
        board.AddSwimLane({
            swimlane: config.swimlanes[0],
            cards: config.projectJson.cards,
            swimlaneAssignments: config.swimlaneAssignments
        })
        expect($.fn.AddKanbanCard).toHaveBeenCalled();
    })

})