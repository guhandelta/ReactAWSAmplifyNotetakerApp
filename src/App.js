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

  handleAddNote = event => {
    event.preventDefault();
    const { note } = this.state;
    const input = { note }; // input = { note: note }
    API.graphql(graphqlOperation(createNote, { input })) // { input*the property required in the graphql query*: input*var* }
  }

  render() {
    const { notes } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washer-red">
        <div className="code f2-1">
          Amplify Notestaker
          {/* Notestaker Form */}
          <form onSubmit={this.handleAddNote} action="" className="mb3">
            <input type="text" name="" id="" className="pa2 f4" placeholder="Your note" onChange={this.handleChangeNote} />
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