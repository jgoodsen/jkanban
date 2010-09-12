$.fn.AddSwimLane = function(options) {

    var defaults = {
        swimlane: null,
        cards: [],
        users: [],
        swimlaneAssignments: []
    };
    var opts = $.extend(defaults, options);
    var self = $(this);

    var content = $('<div class="kanban_swimlane_content"/>');
    $.each(opts.cards, function(i, card_json) {
        if (isCardAssignedToThisSwimlane(card_json)) {
            content.AddKanbanCard({
                card: card_json,
                users: opts.users
            });
        }
    })
    content.sortable({
        handle:'.grippy',
        items: '.kanban_card',
        connectWith: '.kanban_swimlane_content',
        stop: CardDragged

    });


    var swimlane = $('<div class="kanban_swimlane"/>');
    var header = $('<div class="kanban_swimlane_header"/>');
    header.append('<span>' + opts.swimlane.name + '</span>');
    var wip_limit = $('<div class="wip_limit">' + opts.swimlane.wip_limit + '</div>');
    wip_limit.editInPlace({
        callback: function(unused, value, original) {
            var intValue = parseInt(value);
            if (value == (intValue + ""))
                return value;
            return original; // could not convert to an int, return the original value
        }
    });
    header.append(wip_limit);
    swimlane.append(header);

    swimlane.append(content);

    self.append(swimlane);

    function isCardAssignedToThisSwimlane(card) {
        var card_json = card;
        var found = false;
        $.each(opts.swimlaneAssignments, function(i, assignment) {
            if (assignment.card_id == card_json.id && assignment.swimlane_id == opts.swimlane.id) {
                found = true;
            }
        });
        return found;
    }

    function CardDragged(x, ui) {

    }

    ;


}