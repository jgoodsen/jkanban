$.fn.AddKanbanCard = function(options) {

    var defaults = {
        card: null
    };
    var opts = $.extend(defaults, options);

    var self = $(this);

    var header = $('<dt/>');
    header.append('<span class="kanban_card_header">' + opts.card.title + '</span>')

    var html = $('<dt class="kanban_card"/>');
    html.append(header);
    self.append(html);

}
