const TASK_REQUIRE_TIME_MS = 5_000;
// Task queue and current task
const taskQueue = [];
let currentTask = null;

// Function to process a task
export function processTask(task) {
  console.log(
    `Received task ${task.id} with priority ${task.priority}`
  );

  // Add the task to the queue
  taskQueue.push(task);

  // Sort the queue based on priority (higher priority first)
  taskQueue.sort((a, b) => b.priority - a.priority);

  // Check if we need to interrupt the current task
  if (currentTask && task.priority > currentTask.priority) {
    console.log(
      `Pausing task ${currentTask.id} for higher-priority task ${task.id}`
    );
    // Put the current task back into the queue
    currentTask.remainingTime -=
      Math.min(
        TASK_REQUIRE_TIME_MS / 1000,
        currentTask.remainingTime
      ) - currentTask.startedTime;
    taskQueue.push(currentTask);
    currentTask = null;
  }

  // Try to process the next task
  processNextTask();
}

// Function to process the next task in the queue
function processNextTask() {
  if (currentTask || taskQueue.length === 0) {
    return; // Exit if there's an ongoing task or no tasks in the queue
  }

  // Fetch the next task
  const nextTask = taskQueue.shift();
  currentTask = nextTask;

  console.log(
    `Processing task ${nextTask.id} with priority ${nextTask.priority}`
  );

  // Simulate task processing for the defined time
  const processingTime = Math.min(
    nextTask.remainingTime || TASK_REQUIRE_TIME_MS / 1000,
    TASK_REQUIRE_TIME_MS / 1000
  );
  nextTask.startedTime = processingTime;

  setTimeout(() => {
    nextTask.remainingTime =
      (nextTask.remainingTime || TASK_REQUIRE_TIME_MS / 1000) -
      processingTime;

    if (nextTask.remainingTime > 0) {
      console.log(
        `Task ${nextTask.id} paused with ${nextTask.remainingTime} seconds left`
      );
      taskQueue.push(nextTask); // Re-add the paused task to the queue
    } else {
      console.log(`Task ${nextTask.id} completed`);
      nextTask.setTaskDone && nextTask.setTaskDone();
    }

    currentTask = null;
    processNextTask(); // Process the next task
  }, processingTime * 1000);
}
