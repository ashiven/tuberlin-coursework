#include "hash_table.h"

//tries adding a new struct with the key and value and prints an error if the struct has been added already
void htable_set(htable **ht, const unsigned char *key, size_t key_len,
                const unsigned char *value, size_t value_len) {
    htable *result;
    HASH_FIND(hh, *ht, key, key_len, result);
    if(result == NULL || result->value != value) {
        htable *newentry = malloc(sizeof(htable));
        newentry -> key = (unsigned char*)malloc(key_len);
        memcpy(newentry->key, key, key_len);
        newentry -> key_len = key_len;
        newentry -> value = (unsigned char*)malloc(value_len);
        memcpy(newentry->value, value, value_len);
        newentry -> value_len = value_len;
        HASH_ADD_KEYPTR(hh, *ht, key, key_len, newentry);
    }
}

//returns either a pointer to the found struct or a NULL pointer if it wasn't found
htable *htable_get(htable **ht, const unsigned char *key, size_t key_len) {
    htable *result;
    HASH_FIND(hh, *ht, key, key_len, result);
    return result;
}

//returns 0 upon succesful deletion and -1 if struct not found 
int htable_delete(htable **ht, const unsigned char *key, size_t key_len) {
    htable *result;
    HASH_FIND(hh, *ht, key, key_len, result);
    if(result) {
        HASH_DELETE(hh, *ht, result);
        free(result);
        return 0;
    }
    else {
        return -1;
    }
}
