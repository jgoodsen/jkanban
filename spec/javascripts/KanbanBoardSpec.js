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

    it("should add swimlanes", function() {
        spyOn($.fn, 'AddSwimLane');
        board.KanbanBoard(Fixtures.simpleBoardConfig);
        expect($.fn.AddSwimLane).toHaveBeenCalled();

    })

})