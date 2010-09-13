$.fn.AddSwimLane = function(options) {

    var defaults = {
        swimlane: null,
        swimlaneAssignments: []
    };
    var opts = $.extend(defaults, options);
    var self = $(this);

    var content = $('<div class="kanban_swimlane_content"/>');
    $.each(Card.all(), function(i, card_json) {
        if (isCardAssignedToThisSwimlane(card_json)) {
            content.AddKanbanCard({
                card: card_json
            });
        }
    })
    content.sortable({
        handle:'.grippy',
        items: '.kanban_card',
        connectWith: '.kanban_swimlane_content',
        stop: CardDragged

    });


    var swimlane = $('<div class="kanban_swimlane {id:' + opts.swimlane.id + '}"/>');
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
        //        var card_id = $(ui.item).attr('id').replace(/[^\d]+/g, '');
        //        var sibling_cards = $(ui.item).siblings('.kanban_card');
        //        var position = ui.item.prevAll().length;
        //        var card_state = ui.item.parent().attr("id");
//        var to_cards = $('#' + card_state).sortable("serialize");
//        $.post(project_kanban_card_dropped_path(project_id), {
//            'authenticity_token': window._auth_token,
//            'card_id': card_id,
//            'position': position,
//            'card_state': card_state,
//            'cards': to_cards
//        });
//        $(ui.item).fadeIn();
//        updateWipLimitFeedback();
    }

    ;


}