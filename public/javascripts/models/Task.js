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

Task.findByCardId = function (id) {
    return this.all().filter(function(item) { return item.card_id == id; })
};

//Task.findById = function(id) {
//    return this.allTasks.filter(function(task){ return task.id == id;})[0];
//}
//
//Task.nextId = function() {
//    return this.last().id + 1;
//}

//
//Task.create = function(card_id) {
//
//    // TODO: Implement Service call and broadcast the event
//    var newTask = {id: this.nextId(), card_id: card_id};
//
//    this.allTasks.push(newTask);
//    return newTask;
//}
