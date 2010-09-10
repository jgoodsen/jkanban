$.fn.KanbanBoard = function(options) {

    var defaults = {
        swimlanes:[],
        cards: [],
        users: [],
        swimlaneAssignments: []
    };
    var opts = $.extend(defaults, options);

    return this.each(function() {

        $this = $(this);

        // support the meta-data plugin
        var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

        var html = $('<div class="kanban_board"/>');
        $.each(opts.swimlanes, function(i, swimlane) {
            html.AddSwimLane({
                swimlane: swimlane,
                cards: opts.cards,
                users: opts.users,
                swimlaneAssignments: opts.swimlaneAssignments
            })
        })
        $this.append(html);


    });


}
