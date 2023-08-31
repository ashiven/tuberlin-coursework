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
    String s = "(" + xPos + ", " + yPos + ")";
    return s;
  }
}
