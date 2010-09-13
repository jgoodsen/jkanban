function Card() {
}

Card.allCards = [];

Card.all = function() {
    return this.allCards;
}

Card.last = function() {
    var last;
    Card.all().forEach(function(c) {
        last = c;
    });
    return last;
}

Card.findById = function(id) {
    return this.allCards.filter(function(card){ return card.id == id;})[0];
}

Card.nextId = function() {
    return this.last().id + 1;
}


Card.create = function() {

    // TODO: Implement Service call and broadcast the event
    var newCard = {id: this.nextId()};

    this.allCards.push(newCard);
    return newCard;
}

Card.createTask = function(card_id, title) {
    var newTask = Task.create({card_id: card_id, title: title});
    return newTask;
}

