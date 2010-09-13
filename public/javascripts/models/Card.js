function Card() {
}

Card.allItems = [];

Card.all = function() {
    return this.allItems;
}

Card.last = function() {
    var last;
    this.all().forEach(function(c) {
        last = c;
    });
    return last;
}

Card.findById = function(id) {
    return this.all().filter(function(item){ return item.id == id;})[0];
}

Card.nextId = function() {
    return this.last().id + 1;
}

Card.create = function() {

    // TODO: Implement Service call and broadcast the event
    var newItem = {id: this.nextId()};

    this.all().push(newItem);
    return newItem;
}

//
// Has Many Tasks
//
Card.tasks = function(card_id) {
    return Task.findByCardId(card_id);
}
Card.createTask = function(card_id, title) {
    var newItem = Task.create({card_id: card_id, title: title});
    return newItem;
}

