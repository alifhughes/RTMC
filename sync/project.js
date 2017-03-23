var Project = function(name, id, owner) {

    // Set up project
    this.name  = name;
    this.id    = id;
    this.owner = owner;
    this.collaborators = [];
};

/**
 * Add person to the project
 *
 * @param {string} personId  A person's id that wants to join the room
 */
Project.prototype.addPerson = function (personId) {

    this.collaborators.push(personId);

};

/**
 * Remove person from the project
 *
 * @param {object} person  The person object wanting to leave
 */
Project.prototype.removePerson = function (person) {

    // Iterate all people
    for(var i = 0; i < this.people.length; i++){

        // Check if people person passed in is one wanted to remove
        if(this.people[i].id === person.id){

            // Remove person from list
            this.people.remove(i);

            break;
        }
    }
};

module.exports = Project;
