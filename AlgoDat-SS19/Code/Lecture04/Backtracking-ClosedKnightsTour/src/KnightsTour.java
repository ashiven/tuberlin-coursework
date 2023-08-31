import java.util.Stack;

/* A nicer solution for reporting the solution would be to push each move of the solution on a
   stack (instead of printing it directly) and to print that in the end. The Stack<Move> solution
   could be a variable of KnightsTour and then backtracking() is implemented as non-static method
   in order to access that variable.
*/

public class KnightsTour {

    public static boolean backtracking(Board board) {
        Stack<Move> moves = board.validMoves();
        for (Move move : moves) {
            board.doMove(move);
            if (board.isSolved()) {
                System.out.println(move + ".");
                return true;
            }
            boolean solutionFound = backtracking(board);
            if (solutionFound) {
                System.out.println(move + ", ");
                return true;
            }
            board.undoMove(move);
        }
        return false;
    }

    public static void main(String[] args) {
        Board board = new Board(5, 5);
        boolean solvable = backtracking(board);
        if (solvable) {
            System.out.println("from " + board.startPos + " (read bottom-to-top)");
        }
        System.out.println("Lösbar? " + solvable);
    }
}
