function User() {

}

User.findById = function(id, users_json) {
  if (users_json.length == 0)
      throw "empty users_json";

  var foundUser;
  $.each(users_json, function(i, user) {
    if (user.id == id) {
      foundUser = user;
    }
  });
  return foundUser;
}
