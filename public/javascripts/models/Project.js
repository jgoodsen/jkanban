function Project(id, baseUrl) {

    this.baseUrl = "/projects";
    this.id = id;
    this.cards = [];

}

Project.prototype.loadCards = function() {
  $.ajax({
    url: this.baseUrl +"/" + this.id + ".json",
    data: {},
    type: "GET",
    success: function(data, status, request) {
        alert('success');
      this.users = data;
    },
    error: function(request, status, error){
      errorStatus = request.status;

      if (errorStatus == "500") {
        callbacks.onFailure();
      } else if (errorStatus == "503") {
        callbacks.onFailWhale();
      }
    }
  });
}