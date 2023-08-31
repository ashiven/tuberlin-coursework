public class Board
{
  public int sizeX, sizeY;      // wir machen es uns einfach: public!
  private Stack<Token> tokens;  // die Spielsteine auf dem Brett

  Board(int sizeX, int sizeY)
  {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    tokens = new Stack<Token>();
  }

  public void addToken(Token token)
  { tokens.push(token);
  }

  public String toString()
  {
    return "Board of size " + sizeX + "x" + sizeY;
  }
  
  public static void main(String[] args)
  {
    Board board = new Board(5, 7);
    Token token1 = new Token(board, 0, 0);
    board.addToken(token1);
    board.addToken(new Token(board, 2, 2));  // so geht's auch
    token1.moveTo(8, 8);
    System.out.println("Token 1: " + token1);
  }
}
