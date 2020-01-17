import React from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createNote } from './graphql/mutations'

class App extends React.Component {
  state = {
    note: "",
    notes: []
  };

  handleChangeNote = event => this.setState({ note: event.target.value })

  handleAddNote = async event => {
    event.preventDefault();
    const { note, notes } = this.state;
    const input = { note }; // input = { note: note }
    // using async await to receive the response data from the GraphQL mutation
    const result = await API.graphql(graphqlOperation(createNote, { input })) // { input*the property required in the graphql query*: input*var* }
    // result -> response || all teh data is available on the property 'data', in that property, all the note data is available on a -
    //- property 'createNode', which matches teh operation performed here
    const newNote = result.data.createNote
    const updatedNotes = [newNote, ...notes];
    this.setState({ notes: updatedNotes, note: "" });
    // update the notes list along with the latest addition and set the note to empty_string, when calling setState
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
              <button className="bg-transparent bn f4">
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