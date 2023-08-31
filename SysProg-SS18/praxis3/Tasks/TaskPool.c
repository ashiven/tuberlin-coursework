#include "TaskPool.h"
#include "cJSON.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

TaskPool *
newTaskPool(const char *name[], const char *color[], const uint16_t total_time[], const uint16_t arrival_tick[],
            const uint32_t amount) {
    TaskPool *new_task_pool;

    new_task_pool = (TaskPool *) malloc(sizeof(TaskPool));

    new_task_pool->size = amount;
    new_task_pool->total_duration = 0;

    new_task_pool->task = (Task **) malloc(sizeof(Task *) * amount);
    for (uint32_t i = 0; i < amount; i++) {
        new_task_pool->task[i] = newTask(name[i], total_time[i], arrival_tick[i], color[i]);
        new_task_pool->total_duration += total_time[i];
    }

    return new_task_pool;
}

TaskPool *
newTaskPool_JSON(const char *path, const uint32_t file_size, uint16_t *RR_args, uint16_t *MLF_args) {
    /******************
     * Read JSON-File *
     ******************/
    FILE *f = fopen(path, "r");
    if (f == NULL) {
        printf("Could not find: \"%s\"\n", path);
        return NULL;
    }
    char *json_content = (char *) malloc(sizeof(char) * file_size);
    fread(json_content, sizeof(char), file_size - 1, f);
    fclose(f);

    /*******************
     * Parse JSON-File *
     *******************/
    cJSON *root = cJSON_Parse(json_content);
    if (root == NULL) {
        printf("%sERROR:%s JSON-File malformed...\n", COLOR_RED, COLOR_RESET);
        return NULL;
    }

    cJSON *RR_MAX_QUANTUM = cJSON_GetObjectItem(root, "RR_MAX_QUANTUM");
    cJSON *MLF_NUM_QUEUES = cJSON_GetObjectItem(root, "MLF_NUM_QUEUES");
    cJSON *task_pool = cJSON_GetObjectItem(root, "task_pool");

    if (!RR_MAX_QUANTUM || !MLF_NUM_QUEUES || !task_pool) {
        printf("%sERROR:%s JSON-File malformed...\n", COLOR_RED, COLOR_RESET);
        return NULL;
    }

    *RR_args = (uint16_t) (RR_MAX_QUANTUM->valueint);
    *MLF_args = (uint16_t) (MLF_NUM_QUEUES->valueint);

    /**********************************
     * Create TaskPool from JSON-File *
     **********************************/
    uint32_t tasks_amount = cJSON_GetArraySize(task_pool);

    TaskPool *new_task_pool;
    new_task_pool = (TaskPool *) malloc(sizeof(TaskPool) * tasks_amount);

    new_task_pool->size = tasks_amount;
    new_task_pool->task = (Task **) malloc(sizeof(Task *) * tasks_amount);
    new_task_pool->total_duration = 0;

    for (uint32_t i = 0; i < new_task_pool->size; i++) {
        cJSON *task = cJSON_GetArrayItem(task_pool, i);

        char color_tmp[MAX_COLOR_LEN + 1];
        if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "RED", 7))
            strncpy(color_tmp, COLOR_RED, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "GREEN", 7))
            strncpy(color_tmp, COLOR_GREEN, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "YELLOW", 7))
            strncpy(color_tmp, COLOR_YELLOW, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "BLUE", 7))
            strncpy(color_tmp, COLOR_BLUE, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "MAGENTA", 7))
            strncpy(color_tmp, COLOR_MAGENTA, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "CYAN", 7))
            strncpy(color_tmp, COLOR_CYAN, MAX_COLOR_LEN);
        else if (!strncmp(cJSON_GetObjectItem(task, "color")->valuestring, "WHITE", 7))
            strncpy(color_tmp, COLOR_WHITE, MAX_COLOR_LEN);
        else
            strncpy(color_tmp, COLOR_RESET, MAX_COLOR_LEN);

        new_task_pool->task[i] = newTask(cJSON_GetObjectItem(task, "name")->valuestring,
                                         cJSON_GetObjectItem(task, "total_length")->valueint,
                                         cJSON_GetObjectItem(task, "arrival_tick")->valueint,
                                         color_tmp);
        new_task_pool->total_duration += cJSON_GetObjectItem(task, "total_length")->valueint;
    }

    free(json_content);
    cJSON_Delete(root);

    return new_task_pool;
}

bool
freeTaskPool(TaskPool *task_pool) {
    if (task_pool == NULL) return FAILURE;

    for (uint32_t i = 0; i < task_pool->size; i++) {
        freeTask(task_pool->task[i]);
    }

    free(task_pool->task);
    free(task_pool);

    return SUCCESS;
}

Task *
getTask(const TaskPool *task_pool, const uint32_t index) {
    return task_pool->task[index];
}

Task *
checkArrivals(const TaskPool *task_pool, const uint16_t tick) {
    if (task_pool == NULL) return NULL;

    for (uint32_t i = 0; i < task_pool->size; i++) {
        if (task_pool->task[i]->arrival_tick == tick) {
            return task_pool->task[i];
        }
    }

    return NULL;
}

void
allReset(const TaskPool *task_pool) {
    for (uint32_t i = 0; i < task_pool->size; i++) {
        task_pool->task[i]->exec_ticks = 0;
    }
}

bool
allDone(const TaskPool *task_pool) {
    for (uint32_t i = 0; i < task_pool->size; i++) {
        if (!isDone(task_pool->task[i])) {
            return false;
        }
    }

    return true;
}
