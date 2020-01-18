import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

const App = () => {

  const [id, setId] = useState("")
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState([])

  useEffect(() => {
    //useEffect() will work as componentDidMount() || This code gets exe wheneva there is any update in any of the pieces of state
    //Creating a listener in this function will add a listener when the component mounts and removes the listener, on unMount
    getNotes();
    //this reference is not available in rfc and arrow fn(), so all the this ref for the fn() are conv to var declaration 
    const createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      //Above statement returns a listener, that listens for any onCreateNote mutation
      //next is a fn() that allows to get any data returned from the subscription
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote;
        setNotes(prevNotes => {
          const oldNotes = prevNotes.filter(note => note.id !== newNote.id)
          const updatedNotes = [...oldNotes, newNote]
          return updatedNotes
        })
        setNote("");
      }
    });
    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: noteData => {
        //Subscribing to a mutation gives the same data, as the response data from the mutation, which is stored in a var to update state
        const deletedNote = noteData.value.data.onDeleteNote;
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.filter(note => note.id !== deletedNote.id)
          return updatedNotes;
        })
      }
    })
    const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: noteData => {

        const updatedNote = noteData.value.data.onUpdateNote;
        setNotes(prevNotes => {
          const index = prevNotes.findIndex(note => note.id === updatedNote.id)
          const updatedNotes = [
            ...prevNotes.slice(0, index), //1) The part of the array up until the updated note 
            updatedNote, //2) The updated note
            ...prevNotes.slice(index + 1) //3) The part of the array after the updated note
            // 2nd arg is not required for slice() to get from a certain index to the end
          ];
          return updatedNotes;
        })
        setNote("");
        setId("");
      }
    })
    // This is the cleanup fn() in useEffect, where the listeners can be unsubscribed
    return () => {
      createNoteListener.unsubscribe(); //Removing the onCreateNote listener, before component is unMounted
      deleteNoteListener.unsubscribe();
      updateNoteListener.unsubscribe();
    }

  }, []) // useEffect() will be triggered wheneva the notes array in state is updated

  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes(result.data.listNotes.items);
  }

  const hasExistingNote = () => {
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1; // finIndex() returns the index, if found else returns a -1-
      //- isNote is converted into a boolean value, by comparing it with -1
      return isNote;
    }
    return false; // if there is no id in the state and allow for a new note to be created  
  }

  const handleChangeNote = event => setNote(event.target.value)

  const handleAddNote = async event => {

    event.preventDefault();
    //Check if an similar note exists
    if (hasExistingNote()) {
      handleUpdateNote();
      console.log('Note Updated');
    } else {
      const input = { note }; // input = { note: note }
      // using async await to receive the response data from the GraphQL mutation
      await API.graphql(graphqlOperation(createNote, { input })) // var to store the return data from createNote operation is not needed
    }
  }

  const handleSetNote = ({ note, id }) => {
    setNote(note)
    setId(id)
  }
  //- note in the same place

  const handleUpdateNote = async () => {
    const input = { id, note };
    await API.graphql(graphqlOperation(updateNote, { input }))
  }

  const handleDeleteNote = async noteId => {
    const input = { id: noteId };
    await API.graphql(graphqlOperation(deleteNote, { input }));
  }


  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washer-red">
      <div className="code f2-1">
        Amplify Notestaker
        {/* Notestaker Form */}
        <form onSubmit={handleAddNote} action="" className="mb3">
          {/* The <input> is converted into a controlled component, by specifying it with a value and have that value controlled by-
          - state */}
          <input
            type="text"
            className="pa2 f4"
            placeholder="Your note"
            onChange={handleChangeNote}
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
            <li onClick={() => handleSetNote(note)} className="list pa1 f3">
              {/* handleSetNote -> sets the note in state, which will populate the input, with the note date, Since-
              - the input is a controlled component. The entire note data of selected note is sent to the handleSetNote()-
              - handleSetNote() is conv as an arrow fn() to prevent it from being called on pageLoad*/}
              {note.note}
            </li>
            <button onClick={() => handleDeleteNote(note.id)} className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


export default withAuthenticator(App, { includeGreetings: true });
//Include Greetings will provide a header with signout button and a greeting message