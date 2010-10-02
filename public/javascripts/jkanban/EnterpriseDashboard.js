$.fn.EnterpriseDashboard = function(options) {

    var self = $(this);

    var dashboard = $('<div class="dashboard"/>');
    self.append(dashboard);
    var projects = $('<div class="projects"/>');
    Project.all().forEach(function(project) {
        var projectHtml = $('<div class="project {id:' + project.id + '}"/>');

        var projectName = $('<div class="name">' + project.name + '</div>');
        railsInlineTextField(project, projectName, "name", 'Enter project name...', 'text');
        projectHtml.append(projectName);

        var projectDescription = $('<div class="description">' + project.description + '</div>');
        railsInlineTextField(project, projectDescription, "description", 'Enter project description...', 'textarea');
        projectHtml.append(projectDescription);

        projectHtml.append('<a href="/projects/' + project.id + '">View</a>');

        projects.append(projectHtml);
    });
    dashboard.append(projects);

    return self;

}

// A generic inline edit in place handler - pops up an alert for each error
function railsInlineTextField(projectJson, jqueryComponent, fieldName, defaultText, fieldType) {
    jqueryComponent.editInPlace({
        callback: function(notused, newValue, oldValue) {
            return Project.updateAttribute(projectJson, fieldName, newValue,
                    function(successResponse) {
                        var successValue = successResponse[fieldName];
                        if (successValue == "") {
                             jqueryComponent.text(defaultText);
                        } else {
                            jqueryComponent.text(successValue);
                        }
                    },
                    function(errorResponse) {
                        jqueryComponent.text(oldValue);        // restore the field value
                        projectJson[fieldName] = oldValue; // restore the json value 
                        var responseArray = JSON.parse(errorResponse);
                        responseArray.forEach(function(msg) {
                            var key = msg[0];
                            var text = msg[1];
                            alert(key + " " + text);
                        })
                    }
                    );
        },
        field_type: fieldType,
        default_text: defaultText
    });
}
