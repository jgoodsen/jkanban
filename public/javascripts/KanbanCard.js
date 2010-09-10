$.fn.AddKanbanCard = function(options) {

  var defaults = {
    card: null
  };
  var opts = $.extend(defaults, options);

  var self = $(this);

  var header = $('<dt/>');
  header.append('<span class="kanban_card_header">' + opts.card.title + '</span>')

  var gravatars = $('<span class="kanban_card_gravatars">');
  $.each(opts.card.owners, function(i, owner_id) {
    var owner = User.findById(owner_id, opts.users);
    gravatars.append('<img src="' + get_gravatar(owner.email, 30) + '" alt="' + fullName(owner) + '"/>');
  })
  header.append(gravatars);

  var html = $('<dt class="kanban_card"/>');
  html.append(header);
  self.append(html);


  function fullName(user) {
    return user.firstName + " " + user.lastName;
  }

}

function get_gravatar(email, size) {

    var size = size || 80;

    return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size;
}


