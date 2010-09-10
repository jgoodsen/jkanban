$.fn.KanbanBoard = function(options) {

    var defaults = {
        swimlanes:[],
        cards: [],
        users: [],
        swimlaneAssignments: [],
        showControlPanel: true
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
        if (opts.showControlPanel) {
            var panel = makeControlPanel();
            html.append(panel);
        }
        $this.append(html);


    });

    function makeControlPanel() {
        var html = $('<div class="kanban_swimlane control_panel"/>');
        html.append('<div class="control_panel_header"><h1>Control Panel</h1></div>');
        html.append('<div class="control_panel_content">... content ...</div>');
        return html;
    }

}
