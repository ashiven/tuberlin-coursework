import java.util.ArrayList;
import java.lang.Math;

public class TicTacToe {

    public static int alphaBeta(Board board, int player) {
        int result = scorePlayer(board, player, -Integer.MAX_VALUE, Integer.MAX_VALUE);
        if ((board.nFreeFields() - (Math.abs(result) - 1) > 3)) {
            return 0;
        }
        return result;
    }

    public static int scorePlayer(Board board, int player, int alpha, int beta) {
        if (board.isGameWon()) {
            return -(board.nFreeFields() + 1);
        }
        ArrayList valid = (ArrayList) board.validMoves();
        for (int i = 0; i < valid.size(); i++) {
            board.doMove((Position) valid.get(i), player);
            int score = -scorePlayer(board, -player, -beta, -alpha);
            board.undoMove((Position) valid.get(i));
            if (score > alpha) {
                alpha = score;
                if (alpha >= beta) {
                    break;
                }
            }
        }
        return alpha;
    }

    public static void evaluatePossibleMoves(Board board, int player) {
        int[][] evaluations = new int[board.getN()][board.getN()];
        for (int i = 0; i < board.getN(); i++) {
            for (int j = 0; j < board.getN(); j++) {
                evaluations[i][j] = board.bpos[i][j];
            }
        }
        ArrayList valid = (ArrayList) board.validMoves();

        for (int i = 0; i < valid.size(); i++) {
            Position pos = (Position) valid.get(i);
            board.doMove(pos, player);
            evaluations[pos.x][pos.y] = alphaBeta(board, player);
            board.undoMove(pos);
        }

        System.out.print("Evaluation for player");
        if (player == 1) {
            System.out.println(" 'x':");
        } else {
            System.out.println(" 'o':");
        }
        for (int i = 0; i < board.getN(); i++) {
            for (int j = 0; j < board.getN(); j++) {
                if (evaluations[j][i] == 1) {
                    System.out.print(" x ");
                } else if (evaluations[j][i] == -1) {
                    System.out.print(" o ");
                } else if (evaluations[j][i] < 0) {
                    System.out.print(evaluations[j][i] + " ");
                } else {
                    System.out.print(" " + evaluations[j][i] + " ");
                }
            }
            System.out.print("\n");
        }
    }

    public static void main(String[] args) {
        Board b = new Board(10);
        b.print();
    }
}
