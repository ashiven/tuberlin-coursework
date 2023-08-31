public class Token {
  private static final int shape = 0;  // Konstante
  private static int counter;          // Klassenvariable
  private int xPos;
  private int yPos;

  public Token() {
    counter++;
  }

  public Token(int x, int y) { // 2. Konstruktor
    this();                    // Verkettung
    xPos = x;
    yPos = y;
  }

  // getter und setter Methoden:
  public int getXPos() {
    return xPos;
  }

  public void setXPos(int xPos) {
    this.xPos = xPos;
  }

  public int getYPos() {
    return yPos;
  }

  public void setYPos(int yPos) {
    this.yPos =yPos;
  }

  // Objektmethode, um Spielstein zu bewegen:
  public void moveTo(int x, int y) {
    xPos= x;
    yPos= y;
  }

  // Überschreiben von toString() um direkte Ausgabe von Objekten
  // dieser Klasse auf die Konsole zu ermöglichen:
  public String toString() {
    String s = "(" + xPos + ", " + yPos + ")  " + super.toString();
    return s;
  }

  // Beispielprogramm zum Ausführen:
  public static void main(String[] args) {
    Token[] spielstein= new Token[3];
    // Konstruktor mit new aufrufen,
    // um Objekte zu erstellen
    spielstein[0] = new Token(0, 0);
    spielstein[1] = new Token(2, 3);
    spielstein[2] = new Token(4, 6);
    // Methode aufrufen, um
    // Objekt zu veraendern
    spielstein[0].moveTo(0, 1);
    // Zugriff auf Klassenvariable
    System.out.println("Number of Tokens: " + Token.counter);

    System.out.println("Positionen der Spielsteine:");
    // Iteration über Indizes:
    //for (int k = 0; k < Token.counter; k++)
    //  System.out.println(spielstein[k]);

    // direkte Iteration über das Array:
    for (Token tok : spielstein)
      System.out.println(tok);

    System.out.println("\nBeispiel Referenztypen:");
    Token stein1 = new Token(1, 1);
    Token stein2 = stein1;
    System.out.println("Stein1: " + stein1);
    System.out.println("Stein2: " + stein2);
    System.out.println("Stein2 wird auf (2,6) verschoben. Resultat:");
    stein2.moveTo(2,6);
    System.out.println("Stein1: " + stein1);
    System.out.println("Stein2: " + stein2);
  }
}
