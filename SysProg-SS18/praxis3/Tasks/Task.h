#include <pthread.h>
#include <signal.h>
#include <stdint.h>
#include "../Termcolor.h"
#include "../Bool.h"

#ifndef TASK_H
#define TASK_H

#define    MAX_NAME_LEN    50
extern sigset_t global_signal_set;

typedef struct _Task {
    pthread_t thread_id;            ///thread-ID of the task (so scheduler can send individual signals)
    pthread_t scheduler_id;         ///thread-ID of the MAIN-Thread (so signales can be sent back)
    uint16_t exec_ticks;            ///amount ticks the thread was already executed.
    uint16_t total_ticks;           ///total amount of ticks needed to finish the task.
    uint16_t arrival_tick;          ///tick when the task is ready to be executed.
    char name[MAX_NAME_LEN + 1];    ///name of the task.
    char color[MAX_COLOR_LEN +
               1];  ///for ease of the readability, every task can be assigned an ANSI color code. (@see ../Termcolor.h)
} Task;

/**
 * @brief   Creates a new Task structure with the given parameters and internally starts a new thread.
 * @param   name        The name of the Task. Can be a C-String of length MAX_NAME_LEN
 *                      (however single chars usually suffice).
 * @param   total_ticks The amount of ticks required to execute the Task completely.
 * @param   arrival_tick  The tick when the Task is due to be started.
 * @param   color       A C-String of length MAX_COLOR_LEN that determines the
 *                      color used to display the task in a terminal. (see Termcolor.h for possible values)
 * @return  A Pointer to the recently alloc'd Task.
 */
Task *newTask(const char *name, const uint16_t total_ticks, const uint16_t arrival_tick, const char *color);

/**
 * @brief   Frees a Task.
 * @param   task    A pointer to the Task that is to be free'd.
 * @return  If the free() was successful SUCCESS is returned, otherweise FAILURE. (see Bool.h for acutual values).
 */
bool freeTask(Task *task);

/**
 * @brief   Executes the Task for a given amount of ticks. (Will make the program sleep for 100ms!!!).
 * @param   task        A pointer to the Task structure that is to be executed.
 * @param   duration    Number of ticks that the Task is to be executed.
 * @return  The amount of ticks that the Task was executed.
 *          This number is less that duration, if the Task finished before 'duration'-ticks passed.
 */
int16_t execTask(const Task *task, const uint16_t duration);

/**
 * @brief   Resets a Task's exec_ticks to 0.
 * @param   task    A pointer to the Task that is to be reset.
 */
void resetTask(Task *task);

/**
 * @brief   Returns whether a given task is fully executed.
 * @param   task    A pointer to the task in question.
 * @return  True if the exec_ticks of the Task is greater or equal to its total_ticks
 */
bool isDone(const Task *task);

/**
 * @brief   Prints a given Task's name in the specified color to the console.
 * @param   task    A pointer to the Task whose name is to be printed.
 */
void printTask(const Task *task);


#endif
