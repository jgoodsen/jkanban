$.fn.KanbanBoard = function(options) {

    var defaults = {
        projectJson:{},
        swimlanes:[],
        swimlaneAssignments: [],
        showControlPanel: false
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
                cards: opts.projectJson.cards,
                users: opts.projectJson.users,
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
        var content = $('<div class="control_panel_content"/>');

        var cardTypesForm = $('<fieldset/>');
        cardTypesForm.append('<legend>Card Types</legend>');
        $.each(opts.projectJson.cardTypes, function(i, cardType) {
            cardTypesForm.append('<input type="checkbox"/>' + cardType.name);
        });
        content.append(cardTypesForm);

        var html = $('<div class="kanban_swimlane control_panel"/>');
        html.append('<div class="control_panel_header"><h1>Control Panel</h1></div>');
        html.append(content);
        return html;
    }

}
