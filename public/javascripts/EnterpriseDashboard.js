$.fn.EnterpriseDashboard = function(options) {

    var self = $(this);

    var dashboard = $('<div class="dashboard"/>');
    self.append(dashboard);
    var projects = $('<div class="projects"/>');
    Project.all().forEach(function(p) {
        var projectHtml = $('<div class="project {id:' + p.id + '}"/>');

        var projectName = $('<div class="name">' + p.name + '</div>');
        textField(p, projectName, "name", 'Enter project name...', 'text');
        projectHtml.append(projectName);

        var projectDescription = $('<div class="description">' + p.description + '</div>');
        textField(p, projectDescription, "description", 'Enter project description...', 'textarea');
        projectHtml.append(projectDescription);

        projects.append(projectHtml);
    });
    dashboard.append(projects);

    return self;

}

// A generic inline edit in place handler - pops up an alert for each error
function textField(projectJson, projectName, fieldName, defaultText, fieldType) {
    projectName.editInPlace({
        callback: function(notused, newValue, oldValue) {
            return Project.updateAttribute(projectJson, fieldName, newValue,
                    function(successResponse) {
                        var successValue = successResponse[fieldName];
                        if (successValue == "") {
                             projectName.text(defaultText);
                        } else {
                            projectName.text(successValue);
                        }
                    },
                    function(errorResponse) {
                        projectName.text(oldValue);        // restore the field value
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
