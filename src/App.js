import React from 'react';
import { withAuthenticator } from 'aws-amplify-react'

class App extends React.Component {
  state = {
    notes: [
      {
        id: 1,
        note: "Hello World"
      }
    ]
  }

  render() {
    const { notes } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washer-red">
        <div className="code f2-1">
          Amplify Notestaker
          {/* Notestaker Form */}
          <form action="" className="mb3">
            <input type="text" name="" id="" className="pa2 f4" placeholder="Your note" />
            <button className="pa2 f4" type="submit">Add Note</button>
          </form>
        </div>
        {/* Notes List */}
        <div className="">
          {notes.map(note => {
            <div key={note.key} className="flex items-center">
              <li className="list pa1 f3">
                {note.note}
              </li>
              <button className="bg-transparent bn f4">
                <span>&times;</span>
              </button>
            </div>
          })}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
//Include Greetings will provide a header with signout button and a greeting message