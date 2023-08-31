import java.util.Iterator;
public class Stack<E> implements Iterable<E>
{
  private Node head;
  private int N;
 
  private class Node
  { E item;
    Node next;
  }

  public int size()        { return N; }
  public boolean isEmpty() { return N == 0; }
  
  public void push(E item) {
    Node tmp = head;
    head = new Node();
    head.item = item;
    head.next = tmp;
  }

  public E pop()
  { E item = head.item;
    head = head.next;
    N--;
    return item;
  }
  
  public Iterator<E> iterator()
  { return new ListIterator();
  }

  public class ListIterator implements Iterator<E>
  {
    private Node current = head;

    public boolean hasNext() { return current != null; }
    public void remove()     { }  // kein remove
    public E next()
    { E item = current.item;
      current = current.next;
      return item;
    }
  }
}

