function Project(id, baseUrl) {

}

Project.allItems = [];

Project.all = function() {
    return this.allItems;
}

Project.loadAllProjects = function() {

    $.ajax({
        url: "/projects.json",
        type: "GET",
        success: function(data, status, request) {
            Project.allItems = data;
            $('body').trigger("Project.ProjectsLoaded")
        },
        error: function(request, status, error) {
            var errorStatus = request.status;
            alert("An AJAX error occurred " + errorStatus);
            //            if (errorStatus == "500") {
            //                callbacks.onFailure();
            //            } else if (errorStatus == "503") {
            //                callbacks.onFailWhale();
            //            }
        }
    });

};

Project.updateAttribute = function (projectJson, fieldName, newValue, successCallback, errorCallback) {

    projectJson[fieldName] = newValue;
    
    $.ajax({
        url: "/projects/" + projectJson.id + ".json",
        data: {project: projectJson},
        type: "PUT",
        timeout: 2000,
        success: function(resultJson) {
            return successCallback(resultJson);
        },
        error: function(request, status, error) {
            errorCallback(request.responseText);
        }
    });
    return true;
}