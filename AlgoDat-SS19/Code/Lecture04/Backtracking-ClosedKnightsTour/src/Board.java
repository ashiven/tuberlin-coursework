import java.util.Stack;

public class Board {
    public static final int OFF = -1;
    protected Position startPos;
    private int nx;
    private int ny;
    private boolean[][] field;
    private int nFree;
    private Position knightPos;

    public Board(int nx, int ny) {
        this.startPos = new Position(0, 0);
        this.nx = nx;
        this.ny = ny;
        this.field = new boolean[nx][ny];
        this.knightPos = startPos;
        this.nFree = nx * ny - 1;
    }

    public int getField(Position pos) {
        if (pos.x < 0 || pos.x >= nx || pos.y < 0 || pos.y >= ny) {
            return OFF;
        } else {
            return field[pos.x][pos.y] ? 1 : 0;
        }
    }

    public boolean isSolved() {
        return nFree == 0 && knightPos.equals(startPos);
    }

    public void doMove(Move move) {
        knightPos = move.endPosition();
        field[knightPos.x][knightPos.y] = true;
        nFree--;
    }

    public void undoMove(Move move) {
        field[knightPos.x][knightPos.y] = false;
        knightPos = move.pos;
        nFree++;
    }

    public Stack<Move> validMoves() {
        Stack<Move> moves = new Stack<>();
        for (int dir = 0; dir < Move.nDirs; dir++) {
            Move move = new Move(knightPos, dir);
            if (getField(move.endPosition()) == 0) {
                moves.push(move);
            }
        }
        return moves;
    }

}
