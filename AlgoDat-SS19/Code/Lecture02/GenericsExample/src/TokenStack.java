public class TokenStack {
    private Node head;

    private class Node {
        Token item;
        Node next;
    }

    public void push(Token item) {
        Node tmp = head;
        head = new Node();
        head.item = item;
        head.next = tmp;
    }

    // Andere Stack Methoden sind hier weggelassen.
    // Es sollte sowieso die generische Variante verwendet werden.

    public static void main(String[] args) {
        TokenStack tokens = new TokenStack();
        tokens.push(new Token(2, 3));
    }
}
