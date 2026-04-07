import React, { useState } from "react";

function Tasklist() {
  const [TasksList, setTasksList] = useState([]);
  const [input, setInput] = useState('');
  

  const addTask = () => {
    if (input.trim()) {
      setTasksList([...TasksList, input]);
      setInput('');
    }
  };

  const deleteTask = (index) => {
    const newTasks = TasksList.toSpliced(index, 1);
    setTasksList(newTasks);
  };

  return (
    <div style={{ 
      backgroundColor: '#4B0082', 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '50px'
    }}>
      
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Task List</h2>
      
      {/* INPUT SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <input 
          style={{ 
            padding: '10px', 
            borderRadius: '5px 0 0 5px', 
            border: 'none',
            outline: 'none'
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Input Tasks"
        />
        <button 
          onClick={addTask}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '0 5px 5px 0', 
            border: 'none', 
            backgroundColor: '#DA70D6', 
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Add Tasks
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#E6E6FA', 
        width: '90%',
        maxWidth: '500px',
        minHeight: '300px',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}> 
          {TasksList.map((task, index) => (
            <li key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '10px 15px',
              borderRadius: '8px',
              marginBottom: '10px',
              color: '#4B0082',
              fontWeight: '500'
            }}> 
              {task}
              <button 
                onClick={() => deleteTask(index)}
                style={{ 
                  backgroundColor: '#ff4d4d', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              > 
                Delete 
              </button>
            </li>
          ))}
          
          {TasksList.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
              Your list is empty. Add a task above!
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Tasklist;