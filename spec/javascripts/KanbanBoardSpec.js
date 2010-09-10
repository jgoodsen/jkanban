describe("KanbanBoard", function() {

    var board;

    beforeEach(function() {
        $('#jasmine_content').html('<div id="kanban"/>');
        board = $('#kanban');
    })

    it("should append a top level div", function() {
        board.KanbanBoard();
        expect($('#kanban .kanban_board').hasClass("kanban_board")).toEqual(true);
    })

    it("should create the swimlanes", function() {
        board.KanbanBoard(Fixtures.simpleBoardConfig);
        var swimlanes = board.find(".swimlane");
        expect(swimlanes.size()).toEqual(3);
    })

    it("should create the swimlanes", function() {

        spyOn($.fn, 'AddSwimLane').andCallThrough();
        board.KanbanBoard(Fixtures.simpleBoardConfig);

        expect($.fn.AddSwimLane).toHaveBeenCalled();
        var swimlanes = board.find(".swimlane");
        expect(swimlanes.size()).toEqual(3);
    })

})