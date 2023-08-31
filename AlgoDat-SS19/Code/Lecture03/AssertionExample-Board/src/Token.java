public class Token {
  private static final int shape = 0;  // Konstante
  private static int counter;
  private Board board;
  private int xPos, yPos;

  Token(Board board) {
    counter++;
    this.board = board;
  }
  Token(Board board, int x, int y) { // 2. Konstruktor
    this(board);             // Verkettung
    xPos = x;
    yPos = y;
  }

  protected void moveTo(int x, int y) {
    assert x >= 0 && x < board.sizeX : "x-Wert außerhalb des Spielbrettes";
    assert y >= 0 && y < board.sizeY : "y-Wert außerhalb des Spielbrettes";
    xPos= x;
    yPos= y;
  }

  public String toString() {
    String s = "(" + xPos + ", " + yPos + ")" + " on " + board;
    return s;
  }
}
