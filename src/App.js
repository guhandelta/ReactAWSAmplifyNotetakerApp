import React from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createNote, deleteNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'

class App extends React.Component {
  state = {
    note: "",
    notes: []
  };

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  }

  handleChangeNote = event => this.setState({ note: event.target.value })

  handleAddNote = async event => {
    event.preventDefault();
    const { note, notes } = this.state;
    const input = { note }; // input = { note: note }
    // using async await to receive the response data from the GraphQL mutation
    const result = await API.graphql(graphqlOperation(createNote, { input })) // { input*the property required in the graphql query*: input*var* }
    // grapqlOperation( reference to the mutation function, 2nd arg - i/p to the mutation fn(), which should be given in an obj, as the- 
    //- i/p param expected here, as per graphQL is an object )
    // result -> response || all the data is available on the property 'data', in that property, all the note data is available on a -
    //- property 'createNode', which matches teh operation performed here
    const newNote = result.data.createNote
    const updatedNotes = [newNote, ...notes];
    this.setState({ notes: updatedNotes, note: "" });
    // update the notes list along with the latest addition and set the note to empty_string, when calling setState
  }

  handleDeleteNode = async noteId => {
    const { notes } = this.state;
    const input = { id: noteId };
    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    // deleteNote mutation fn() returns the id of the note/item deleted
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId);// filter() will filter out the deleted note from notes
    this.setState({ notes: updatedNotes });
  }

  render() {
    const { note, notes } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washer-red">
        <div className="code f2-1">
          Amplify Notestaker
          {/* Notestaker Form */}
          <form onSubmit={this.handleAddNote} action="" className="mb3">
            {/* The <input> is converted into a controlled component, by specifying it with a value and have that value controlled by-
            - state */}
            <input
              type="text"
              className="pa2 f4"
              placeholder="Your note"
              onChange={this.handleChangeNote}
              value={note}
            />
            <button className="pa2 f4" type="submit">Add Note</button>
          </form>
        </div>
        {/* Notes List */}
        <div>
          {notes.map(note => (
            <div key={note.key} className="flex items-center">
              <li className="list pa1 f3">
                {note.note}
              </li>
              <button onClick={() => this.handleDeleteNode(note.id)} className="bg-transparent bn f4">
                {/* this.handleDeleteNode(item.id) is gven as an arrow function, so this won't be called during the page load, since-
                - arguments are passed onto the funciton */}
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
//Include Greetings will provide a header with signout button and a greeting message