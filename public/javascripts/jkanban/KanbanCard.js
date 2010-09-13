
$.fn.AddKanbanCard = function(options) {

    var defaults = {
        card: null,
        cardGravatarSize: 25,
        taskGravatarSize: 15
    };
    var opts = $.extend(defaults, options);

    var self = $(this);
    var html = $('<div class="kanban_card {id:' + opts.card.id + '}"/>');

    //
    // Expand/Collapse Arrow and Title
    //
    {
        var titleBar = $('<div class="kanban_card_title"/>');
        titleBar.append($('<span class="grippy card_grippy"/>'));
        var title = $('<div class="title"/>').text(opts.card.title);
        title.editInPlace({
            callback: function(notused, value, oldValue) {
            },
            field_type: 'textarea'

        })
        titleBar.append(title);
    }
    html.append(titleBar);

    //
    // Card Header
    //
    var header = $('<div class="kanban_card_header"/>');

    var expandCollapseArrow = $('<div class="expand_collapse_arrow expand">Expand/Collapse</div>');
    expandCollapseArrow.click(function() {
        var arrowToggle = $(this);
        var parent = $(this).parent().parent();
        if (arrowToggle.hasClass("expand")) {
            parent.find(".kanban_card_body").show();
        } else {
            parent.find(".kanban_card_body").hide();
        }
        $(this).toggleClass("expand").toggleClass("collapse");
    });
    header.append(expandCollapseArrow);

    var gravatars = $('<div class="kanban_card_gravatars"/>');
    $.each(opts.card.owners, function(i, owner_id) {
        var owner = User.findById(owner_id);
        gravatars.append('<img class="gravatar"  src="' + get_gravatar(owner, opts.cardGravatarSize) + '" title="' + fullName(owner) + '"/>');
    })
    if (gravatars.children().size() == 0) {
        gravatars.append('<div class="gravatar unknown_gravatar">' + '?' + '</div>');
    }
    header.append(gravatars);

    html.append(header);


    //
    // Card Body
    //
    var body = $('<div class="kanban_card_body"/>').css("display", "none");
    {
        //
        // Tasks Tab
        //
        var tasks_tab_content = $('<div class="kanban_card_body_tasks"/>');
        $.each(Card.tasks(opts.card.id), function(i, task) {
            tasks_tab_content.append(makeTask(task));
        })

        // New Task Form
        var newTaskInput = $('<input class="kanban_card_new_task" value="<Add a new task>"/>');
        newTaskInput.clearOnFocus();

        var form = $('<form action="#"/>');
        form.append(newTaskInput);
        form.ajaxForm(function() {
            var value = newTaskInput.val();
            var task = Card.createTask(opts.card.id, value);
            form.parent().parent().find('.kanban_card_body_tasks').append(makeTask(task));
            newTaskInput.val('');
        });
        var outer = $('<div/>');
        outer.append(tasks_tab_content);
        outer.append(form);

        body.append(outer);
    }
    tasks_tab_content.sortable({
        handle : '.task_grippy',
        connectWith: '.kanban_card_body_tasks',
        update : function () {
            var order = tasks_tab_content.sortable('serialize');
        }
    });

    html.append(body);
    self.append(html);


    //
    // Hover Actions
    //
    var hoverActive = false; //  A hack - the mouse-enter was getting triggered inside its drag event
    html.mouseenter(function() {
        if (!hoverActive) {
            var container = $(this).find('.kanban_card_header');
            var html = $('<div class="card_hover_actions" />');
            html.append('<div class="action edit" title="Card Details Page"/>');
            html.append('<div class="action delete" title="Delete this card"/>');
            html.append('<div class="action comments" title="Card Comments"/>');
            html.append('<div class="action comments" title="View this card in Jira"/>');
            container.append(html);
            hoverActive = true;
        }
    })
    html.mouseleave(function() {
        $(this).removeClass('kanban_card_hover');
        $(this).find('.card_hover_actions').remove();
        hoverActive = false;
    })


    //
    // PRIVATE METHODS
    //
    function fullName(user) {
        return user.firstName + " " + user.lastName;
    }

    function makeTask(task) {
        var tsskHtml = $('<div class="kanban_card_task {id:"' + task.id + '}"/>');
        tsskHtml.append($('<span class="grippy task_grippy"/>'));
        tsskHtml.append($('<span class="state"/>').addClass(classForImageState(task.state)));
        function imageForTaskOwner(task, i) {
            if (task.owners[i] != undefined) {
                var user = User.findById(task.owners[i], opts.users);
                return '<img src="' + get_gravatar(user, opts.taskGravatarSize) + '"/>';
            } else {
                return '<div class="no_task_owner"/>';
            }
        }

        tsskHtml.append($('<span class="owner"/>').html(imageForTaskOwner(task, 0)));
        tsskHtml.append($('<span class="owner"/>').html(imageForTaskOwner(task, 1)));
        tsskHtml.append('<div class="title"/>');
        tsskHtml.find('.title').html(task.title).editInPlace({
            callback: function(unused, enteredText) {
                return enteredText;
            }
        });
        tsskHtml.mouseenter(function() {
            $(this).addClass("task_hover");
        })
        tsskHtml.mouseleave(function() {
            $(this).removeClass("task_hover");
        })

        return tsskHtml;
    }

    function get_gravatar(user, size) {
        var size = size || 80;
        return makeGravatarUrl(user.gravatarHash, size)
    }

    function makeGravatarUrl(hash, size) {
        return 'http://www.gravatar.com/avatar/' + hash + '.jpg?s=' + size;
    }

    function classForImageState(state) {
        switch (state) {
            case 1:
                return "task_state_started"
                break;
            case 2:
                return "task_state_completed"
                break;
            case 3:
                return "task_state_blocked"
                break;
            default:
                return "task_state_not_started"
        }
    }


}



