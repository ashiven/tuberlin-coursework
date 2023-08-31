/* === INTROPROG ABGABE ===
 * Blatt 6, Aufgabe 2
 * Tutorium: txx
 * Gruppe: gxx
 * Gruppenmitglieder:
 *  - Max Mustermann
 *  - Rainer Testfall
 * ========================
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "introprog_telefonbuch.h"

void bst_insert_node(bstree *bst, unsigned long phone, char *name)
{
	bst_node *check = find_node(bst, phone);
	if (check)
	{
		printf("Fehler: Telefonnummer entspricht nicht den Vorgaben oder Telefonnummer bereits vorhanden\n");
		return;
	}

	int len = strlen(name) + 1;
	char *newname = (char *)malloc(len * sizeof(char));
	snprintf(newname, len, "%s", name);
	bst_node *new_elem = (bst_node *)malloc(sizeof(bst_node));

	new_elem->phone = phone;
	new_elem->name = newname;
	new_elem->left = NULL;
	new_elem->right = NULL;

	if (bst->root == NULL)
	{
		new_elem->parent = NULL;
		bst->root = new_elem;
	}
	else
	{
		bst_node *next = bst->root;
		bst_node *prev = NULL;
		while (next)
		{
			if (next->phone < phone)
			{
				prev = next;
				next = next->right;
			}
			else
			{
				prev = next;
				next = next->left;
			}
		}
		if (prev->phone < phone)
		{
			new_elem->parent = prev;
			prev->right = new_elem;
		}
		else
		{
			new_elem->parent = prev;
			prev->left = new_elem;
		}
	}
}

bst_node *find_node(bstree *bst, unsigned long phone)
{
	if (phone < 1 || phone > 9999)
	{
		return NULL;
	}

	bst_node *temp = bst->root;
	while (temp)
	{
		if (phone == temp->phone)
		{
			return temp;
		}
		else if (phone <= temp->phone)
		{
			temp = temp->left;
		}
		else
		{
			temp = temp->right;
		}
	}
	return NULL;
}

void bst_in_order_walk_node(bst_node *node)
{
	if (node)
	{
		bst_in_order_walk_node(node->left);
		print_node(node);
		bst_in_order_walk_node(node->right);
	}
}

void bst_in_order_walk(bstree *bst)
{
	if (bst)
	{
		bst_in_order_walk_node(bst->root);
	}
}

void bst_free_subtree(bst_node *node)
{
	if (node)
	{
		bst_free_subtree(node->left);
		bst_free_subtree(node->right);
		free(node->name);
		free(node);
	}
}

void bst_free_tree(bstree *bst)
{
	if (bst && bst->root != NULL)
	{
		bst_free_subtree(bst->root);
		bst->root = NULL;
	}
}
