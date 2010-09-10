var Fixtures = {

    simpleBoardConfig: {

         swimlanes: [
             {id: 20, name: "Ready"},
             {id: 21, name: "In Progress"},
             {id: 22, name: "Done"}
         ],

         cards: [
             {id:100, title:'Card One'},
             {id:101, title:'Card Two'},
             {id:102, title:'Card Three'}
         ],

         swimlane_assignments: [
             {card_id: 100, swimlane_id: 20},
             {card_id: 101, swimlane_id: 21},
             {card_id: 102, swimlane_id: 22}
         ]

     }

}