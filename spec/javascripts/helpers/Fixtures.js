var Fixtures = {

    simpleBoardConfig: {
         showControlPanel: true,
         users: [
           {id: 10, email: 'john.goodsen@gmail.com', firstName: 'John', lastName: 'Goodsen', admin: true, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'},
           {id: 11, email: 'eric.clapton@gmail.com', firstName: 'Eric', lastName: 'Clapton', admin: false, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'},
           {id: 12, email: 'axel.rose@gmail.com', firstName: 'Axl', lastName: 'Rose', admin: false, gravatarHash: 'a583d290ee066ff2a63b84b9d5f265c2'}
         ],
         swimlanes: [
             {id: 20, name: "Ready"},
             {id: 21, name: "In Progress"},
             {id: 22, name: "Done"}
         ],

         cards: [
             {id:100, title:'Now is the time for all good men to come to the aid of their country', owners: [10, 11]},
             {id:101, title:'Card Two', owners: [12]},
             {id:102, title:'Card Three', owners: []}
         ],

         swimlaneAssignments: [
             {card_id: 100, swimlane_id: 20},
             {card_id: 101, swimlane_id: 21},
             {card_id: 102, swimlane_id: 22}
         ]

     }

}