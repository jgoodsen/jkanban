function Task() {
}

Task.allItems = [];

Task.all = function() {
    return this.allItems;
}

Task.last = function() {
    var last;
    this.all().forEach(function(c) {
        last = c;
    });
    return last;
}

Task.findAllByCardId = function (card_id) {
    return this.all().filter(function(item) { return item.card_id == card_id; })
};

Task.findById = function(id) {
    return this.allItems.filter(function(item){ return item.id == id;})[0];
}

Task.nextId = function() {
    return this.last().id + 1;
}


Task.create = function(opts) {

    // TODO: Implement Service call and broadcast the event
    var newTask = {id: this.nextId(), card_id: opts.card_id, title: opts.title, owners: []};

    this.all().push(newTask);
    return newTask;
}
