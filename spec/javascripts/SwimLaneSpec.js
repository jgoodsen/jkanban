describe("SwimLane", function(){

    var config = BoardFixtures.simpleBoardConfig;
    var board;

    beforeEach(function() {
        loadSimpleProjectJsonFixtures();
        board = $('#jasmine_content');
    });


    it("Should add a swimlane div", function(){
        board.AddSwimLane({
            swimlane: config.swimlanes[0],
            swimlaneAssignments: config.swimlaneAssignments
        })
        expect(board.find(".kanban_swimlane").size()).toEqual(1);
    })

    it("Should add it's allocated cards", function(){
        spyOn($.fn, 'AddKanbanCard');
        board.AddSwimLane({
            swimlane: config.swimlanes[0],
            swimlaneAssignments: config.swimlaneAssignments
        })
        expect($.fn.AddKanbanCard).toHaveBeenCalled();
    })

    it("should stash its id in it's metadata", function(){
        board.AddSwimLane({
            swimlane: config.swimlanes[0],
            swimlaneAssignments: config.swimlaneAssignments
        })
        expect(board.find(".kanban_swimlane").metadata().id).toEqual(config.swimlanes[0].id);        
    })

})