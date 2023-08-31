public class TokenStackWithGenerics {

    public static void main(String[] args) {
        // Hier wird der generische Stack genutzt, mit Typ 'Token'
        Stack<Token> tokens = new Stack<>();

        // Erzeugung einiger Exemplare:
        tokens.push(new Token(0, 0));
        tokens.push(new Token(2, 3));
        tokens.push(new Token(4, 6));

        // Direktes Iterieren möglich, das Stack das Interface Iterable implementiert
        for (Token token : tokens)
            System.out.println(token);
    }
}
