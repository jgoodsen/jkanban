var ProjectFixtures = {
    simpleProjectJson: {
        users: [
            {id: 10, email: 'john.goodsen@gmail.com', firstName: 'John', lastName: 'Goodsen', admin: true, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'},
            {id: 11, email: 'eric.clapton@gmail.com', firstName: 'Eric', lastName: 'Clapton', admin: false, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'},
            {id: 12, email: 'axel.rose@gmail.com', firstName: 'Axl', lastName: 'Rose', admin: false, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'}
        ],

        cards: [
            {id:100,
              card_type_id: 204,
              title:'Now is the time for all good men to come to the aid of their country',
              owners: [10, 11],
              tasks: [
                {id: 601, title: 'Do XYZ', owners: [11,12], state: 0},
                {id: 602, title: 'Do Another Thing', owners: [11], state: 1},
                {id: 603, title: 'If you do not do this before your mother gets home...', owners: [10], state: 0},
                {id: 604, title: 'Glad I did this one before mom got home', owners: [10,11], state: 2}
              ]
            },
            {id:101, card_type_id: 200, title:'Card Two', owners: [12]},
            {id:102, card_type_id: 201, title:'Card Three', owners: []},
            {id:103, card_type_id: 202, title:'Now was the time for all good men to come to the aid of their country', owners: [10, 11]},
            {id:104, card_type_id: 201, title:'Card Three', owners: []},
            {id:105, card_type_id: 202, title:'Card Three', owners: []},
            {id:106, card_type_id: 201, title:'When is the time for all good men to come to the aid of their country>?', owners: [10, 11]}
        ],
        cardTypes:[
            {id:200, name:'Epic'},
            {id:201, name:'Feature'},
            {id:202, name:'Story'},
            {id:203, name:'Defect'},
            {id:204, name:'Chore'}
        ]
    }
};

var BoardFixtures = {

    simpleBoardConfig: {
        projectJson: ProjectFixtures.simpleProjectJson,
        showControlPanel: true,
        swimlanes: [
            {id: 20, name: "Ready"},
            {id: 21, name: "In Progress"},
            {id: 22, name: "Done"}
        ],
        swimlaneAssignments: [
            {card_id: 100, swimlane_id: 20},
            {card_id: 101, swimlane_id: 21},
            {card_id: 102, swimlane_id: 22},
            {card_id: 103, swimlane_id: 20},
            {card_id: 104, swimlane_id: 21},
            {card_id: 105, swimlane_id: 21},
            {card_id: 106, swimlane_id: 21}
        ]

    }

};