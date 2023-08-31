#include "../Bool.h"
#include "Task.h"
#include <stdint.h>

#ifndef TASK_POOL_H
#define TASK_POOL_H

typedef struct _TaskPool {
    Task **task;
    uint32_t size;
    uint32_t total_duration;
} TaskPool;

/**
 * @brief   Creates a new TaskPool-structure containing the Tasks with the given parameters.
 * @param   name[]      An array of C-Strings, declaring the names of the Tasks in the TaskPool.
 * @param   color       An array of C-Strings, declaring the colors of the Tasks in the TaskPool.
 * @param   total_time  An array of uint16_t, declaring the total amount of ticks needed to
                        execute every individual Task in the TaskPool.
 * @param   start_tick  An array of uint16_t, declaring the start ticks of every individual Task in the TaskPool.
 * @param   amount      A uint32_t describing the amount of Tasks that are to be created.
 * @return  A pointer to the recently alloc'd TaskPool-structure.
 */
TaskPool *
newTaskPool(const char *name[], const char *color[], const uint16_t total_time[], const uint16_t start_tick[],
            const uint32_t amount);

/**
 * @brief       Reads in a given JSON-File and creates a TaskPool from it.
 * @param       path        The path to the JSON-File.
 * @param       file_size   The amount of bytes in the JSON-File.
 * @param[out]  RR_args     Writes the read value of the JSON-File to a variable, that can be passed to the round robin scheduler.
 * @param[out]  MLF_args    Writes the read value of the JSON-File to a variable, that can be passed to the MLF scheduler.
 * @return      A pointer to the recently alloc'd TaskPool-structure.
 */
TaskPool *newTaskPool_JSON(const char *path, const uint32_t file_size, uint16_t *RR_args, uint16_t *MLF_args);

/**
 * @brief   Frees a given TaskPool.
 * @param   task_pool   A pointer to the TaskPool that is to be free'd
 * @return  If the free() was successful SUCCESS is returned, otherwise FAILURE. (see Bool.h for acutual values).
 */
bool freeTaskPool(TaskPool *task_pool);

/**
 * @brief   Fetches a Task from a TaskPool with the given index.
 * @param   task_pool   A pointer to the TaskPool that stores the desired Task.
 * @param   index       The Index of the Task in question. (Depends on where you put it in your array/JSON-FILE).
 * @return  A pointer to the requested Task.
 */
Task *getTask(const TaskPool *task_pool, const uint32_t index);

/**
 * @brief   Runs through a given TaskPool looking whether a Task is ready to be scheduled.
 *          (For your assignment it is safe to assume, that only ONE Task arrives at a tick.)
 * @param   task_pool   A pointer to the TaskPool that is to be queried.
 * @param   tick        The tick for which the TaskPool is queried for new arrivees.
 * @return  A pointer to a Task that is ready to be scheduled. NULL if none arrive.
 */
Task *checkArrivals(const TaskPool *task_pool, const uint16_t tick);

/**
 * @brief   Resets the exec_ticks of all Tasks in a TaskPool.
 * @param   task_pool   A pointer to the TaskPool whose Tasks are to be reset.
 */
void allReset(const TaskPool *task_pool);

/**
 * @brief   Returns whether all the Tasks in given TaskPool are fully executed.
 * @param   task_pool   A pointer to the TaskPool that is to be queried.
 * @return  If all Tasks are done true, otherwise false.
 */
bool allDone(const TaskPool *task_pool);

#endif
