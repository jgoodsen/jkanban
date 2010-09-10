$.fn.AddSwimLane = function(options) {

    var defaults = {
        swimlane: null,
        cards: [],
        swimlaneAssignments: []
    };
    var opts = $.extend(defaults, options);
    var self = $(this);

    var content = $('<div class="kanban_swimlane_content/>"');
    $.each(opts.cards, function(i, card) {
        if (cardAssignedToSwimlane(card)) {
            content.AddKanbanCard({card: card});
        }
    })


    var swimlane = $('<div class="kanban_swimlane"/>');
    swimlane.append('<div class="kanban_swimlane_header"/>');
    swimlane.append(content);

    self.append(swimlane);

    function cardAssignedToSwimlane(card) {
        var card_json = card;
        var found = false;
        $.each(opts.swimlaneAssignments, function(i, assignment) {
            if (assignment.card_id == card_json.id && assignment.swimlane_id == opts.swimlane.id) {
                found = true;
            }
        });
        return found;

    }

}