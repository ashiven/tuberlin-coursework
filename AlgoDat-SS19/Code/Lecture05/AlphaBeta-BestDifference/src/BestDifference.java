public class BestDifference {
    private Game game;

    public BestDifference(int[] values) {
        game = new Game(values);
    }

    public int alphaBeta()
    {
        return scorePlayerA(Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    public int scorePlayerA(int alpha, int beta) {
        if (game.isFinal()) {
            return game.score();
        }
        for (int move : Game.moves) {
            game.doMove(move);
            int score = scorePlayerB(alpha, beta);
            game.undoMove(move);
            if (score > alpha) {
                alpha = score;
                if (alpha >= beta) break;
            }
        }
        return alpha;
    }

    public int scorePlayerB(int alpha, int beta) {
        if (game.isFinal()) {
            return game.score();
        }
        for (int move : Game.moves) {
            game.doMove(move);
            int score = scorePlayerA(alpha, beta);
            game.undoMove(move);
            if (score < beta) {
                beta = score;
                if (beta <= alpha) break;
            }
        }
        return beta;
    }

    public static void main(String[] args) {
        int[] values = {2, 8, 3, 5, 4, 1};
//        int[] values = Game.randomSequence(40);
        BestDifference bd = new BestDifference(values);
        System.out.println("Score: " + bd.alphaBeta());
    }
}
