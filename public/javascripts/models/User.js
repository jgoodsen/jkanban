function User() {

}

User.allItems = [];

User.findById = function(id) {
}

User.all = function() {
    return this.allItems;
}

User.last = function() {
    var last;
    this.all().forEach(function(c) {
        last = c;
    });
    return last;
}

User.findById = function(id) {
    return this.all().filter(function(item){ return item.id == id;})[0];
}

