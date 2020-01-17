import React from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

class App extends React.Component {
  state = {
    id: "",
    note: "",
    notes: []
  };

  componentDidMount() {
    //Creating a listener in this function will add a listener when the component mounts and removes the listener, on unMount
    this.getNotes();
    this.createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      //Above statement returns a listener, that listens for any onCreateNote mutation
      //next is a fn() that allows to get any data returned from the subscription
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote;
        const prevNotes = this.state.notes.filter(note => note.id !== newNote.id); //Making sure there is no note already with the same id
        const updatedNotes = [...prevNotes, newNote];
        this.setState({ notes: updatedNotes });
      }
    });
    this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: noteData => {
        //Subscribing to a mutation gives the same data, as the response data from the mutation, which is stored in a var to update state
        const deletedNote = noteData.value.data.onDeleteNote;
        const updatedNotes = this.state.notes.filter(note => note.id !== deletedNote.id);
        this.setState({ notes: updatedNotes });
      }
    })
    this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: noteData => {
        const { notes } = this.state;
        const updatedNote = noteData.value.data.onUpdateNote;
        const index = notes.findIndex(note => note.id === updatedNote.id)
        const updatedNotes = [
          ...notes.slice(0, index), //1) The part of the array up until the updated note 
          updatedNote, //2) The updated note
          ...notes.slice(index + 1) //3) The part of the array after the updated note
          // 2nd arg is not required for slice() to get from a certain index to the end
        ]
        this.setState({ notes: updatedNotes, note: "", id: "" });

      }
    })
  }

  componentWillUnmount() {
    this.createNoteListener.unsubscribe(); //Removing the onCreateNote listener, before component is unMounted
    this.deleteNoteListener.unsubscribe();
    this.updateNoteListener.unsubscribe();
  }

  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  }

  hasExistingNote = () => {
    const { notes, id } = this.state;
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1; // finIndex() returns the index, if found else returns a -1-
      //- isNote is converted into a boolean value, by comparing it with -1
      return isNote;
    }
    return false; // if there is no id in the state and allow for a new note to be created  
  }

  handleChangeNote = event => this.setState({ note: event.target.value })

  handleAddNote = async event => {
    event.preventDefault();
    const { note, notes } = this.state;
    event.preventDefault();
    //Check if an similar note exists
    if (this.hasExistingNote()) {
      this.handleUpdateNote();
      console.log('Note Updated');
    } else {
      const input = { note }; // input = { note: note }
      // using async await to receive the response data from the GraphQL mutation
      await API.graphql(graphqlOperation(createNote, { input })) // var to store the return data from createNote operation is not needed
      // grapqlOperation( reference to the mutation function, 2nd arg - i/p to the mutation fn(), which should be given in an obj, as the- 
      //- i/p param expected here, as per graphQL is an object )
      // result -> response || all the data is available on the property 'data', in that property, all the note data is available on a -
      //- property 'createNote', which matches the operation performed here
      // const newNote = result.data.createNote --> this logic has been added in the subscriber
      // const updatedNotes = [newNote, ...notes];
      // this.setState({ notes: updatedNotes, note: "" }); -> updating the notes array is done by the subscriber, and this should be removed
      this.setState({ note: "" });
      // update the notes list along with the latest addition and set the note to empty_string, when calling setState  
    }
  }

  handleSetNote = ({ note, id }) => this.setState({ note, id })// id is to find where the note originally was, in the list and add the updated-
  //- note in the same place

  handleUpdateNote = async () => {
    const { id, notes, note } = this.state;
    const input = { id, note };
    await API.graphql(graphqlOperation(updateNote, { input }))
    // const updatedNote = result.data.updateNote;
    // const index = notes.findIndex(note => note.id === updatedNote.id)
    // const updatedNotes = [
    //   ...notes.slice(0, index), //1) The part of the array up until the updated note 
    //   updatedNote, //2) The updated note
    //   ...notes.slice(index + 1) //3) The part of the array after the updated note
    //   // 2nd arg is not required for slice() to get from a certain index to the end
    // ]
    // this.setState({ notes: updatedNotes, note: "", id: "" });
  }

  handleDeleteNote = async noteId => {
    // const { notes } = this.state;
    const input = { id: noteId };
    await API.graphql(graphqlOperation(deleteNote, { input }));
    // deleteNote mutation fn() returns the id of the note/item deleted
    // const deletedNoteId = result.data.deleteNote.id;
    // const updatedNotes = notes.filter(note => note.id !== deletedNoteId);// filter() will filter out the deleted note from notes
    // this.setState({ notes: updatedNotes });
  }

  render() {
    const { id, note, notes } = this.state;
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
            <button className="pa2 f4" type="submit">
              {id ? "Update Note" : "Add Note"}
            </button>
          </form>
        </div>
        {/* Notes List */}
        <div>
          {notes.map(note => (
            <div key={note.id} className="flex items-center">
              <li onClick={() => this.handleSetNote(note)} className="list pa1 f3">
                {/* handleSetNote -> sets the note in state, which will populate the input, with the note date, Since-
                - the input is a controlled component. The entire note data of selected note is sent to the handleSetNote()-
                - handleSetNote() is conv as an arrow fn() to prevent it from being called on pageLoad*/}
                {note.note}
              </li>
              <button onClick={() => this.handleDeleteNote(note.id)} className="bg-transparent bn f4">
                {/* this.handleDeleteNote(item.id) is gven as an arrow function, so this won't be called during the page load, since-
                - arguments are passed onto the function */}
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