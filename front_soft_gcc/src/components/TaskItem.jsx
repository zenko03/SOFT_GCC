import React from 'react';

function TaskItem({ task }) {
  return (
    <div className="task-item">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
}

export default TaskItem;
