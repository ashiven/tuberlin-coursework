/* === INTROPROG ABGABE ===
 * Blatt 1, Aufgabe 1
 * Tutorium: txx
 * Abgabe von: Max Mustermann
 * ========================
 */

#include <stdio.h>
#include <stdlib.h>
#include "arrayio.h"

#define MAX_LAENGE 1000

void insertion_sort(int array[], int len)
{
    for (int i = 1; i < len; i++)
    {
        int j, key;
        key = array[i];
        j = i - 1;
        while (j >= 0 && array[j] > key)
        {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
}

int main(int argc, char *argv[])
{

    if (argc < 2)
    {
        printf("Aufruf: %s <Dateiname>\n", argv[0]);
        printf("Beispiel: %s zahlen.txt\n", argv[0]);
        exit(1);
    }

    char *filename = argv[1];

    int array[MAX_LAENGE];
    int len = read_array_from_file(array, MAX_LAENGE, filename);

    printf("Unsortiertes Array:");
    print_array(array, len);

    insertion_sort(array, len);

    printf("Sortiertes Array:");
    print_array(array, len);

    return 0;
}
