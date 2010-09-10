$.fn.KanbanBoard = function(options) {

    var defaults = {
        swimlanes:[],
        cards: [],
        swimlaneAssignments: []
    };
    var opts = $.extend(defaults, options);

    return this.each(function() {

        $this = $(this);

        // support the meta-data plugin
        var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

        var html = $('<div class="kanban_board"/>');
        html.append()
        $.each(opts.swimlanes, function(i, swimlane) {
            html.AddSwimLane({
                swimlane: swimlane,
                cards: opts.cards,
                swimlaneAssignments: opts.swimlaneAssignments
            })
        })
        $this.append(html);


    });


}
