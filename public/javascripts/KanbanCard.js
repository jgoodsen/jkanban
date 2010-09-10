$.fn.AddKanbanCard = function(options) {

    var defaults = {
        card: null
    };
    var opts = $.extend(defaults, options);

    var self = $(this);

    var html = $('<div class="kanban_card"/>');

    var header = $('<div class="kanban_card_header"/>');
    var gravatars = $('<div class="kanban_card_gravatars"/>');
    $.each(opts.card.owners, function(i, owner_id) {
        var owner = User.findById(owner_id, opts.users);
        gravatars.append('<img class="gravatar"  src="' + get_gravatar(owner, 30) + '" title="' + fullName(owner) + '"/>');
    })
    if (gravatars.children().size() == 0) {
        gravatars.append('<div class="gravatar unknown_gravatar">' + '?' + '</div>');
    }
    header.append(gravatars);
    header.append('<div class="expand_collapse_arrow expand">Expand/Collapse</div>');
    header.append('<div class="kanban_card_title">' + opts.card.title + '</div>');


    html.append(header);

    var body = $('<div class="kanban_card_body"/>').css("display", "none");

    html.append(body);

    self.append(html);

    header.find(".expand_collapse_arrow").click(function() {
        var arrowToggle = $(this);
        if (arrowToggle.hasClass("expand")) {
            $(this).parents(".kanban_card").find(".kanban_card_body").show();
        } else {
            $(this).parents(".kanban_card").find(".kanban_card_body").hide();
        }
        $(this).toggleClass("expand").toggleClass("collapse");
    });

    function fullName(user) {
        return user.firstName + " " + user.lastName;
    }

}

function get_gravatar(user, size) {
    var size = size || 80;
    var randomNumber = Math.floor(Math.random() * 1000); // random url the browser from caching
    return 'http://www.gravatar.com/avatar/' + user.gravatarHash + '.jpg?s=' + size + '&' + randomNumber;
}


