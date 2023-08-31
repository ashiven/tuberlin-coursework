public class BestDifferenceVerbose {
    private Game game;

    public BestDifferenceVerbose(int[] values) {
        game = new Game(values);
    }

    public int alphaBeta()
    {
        return scorePlayerA(Integer.MIN_VALUE, Integer.MAX_VALUE, 0);
    }

    public int scorePlayerA(int alpha, int beta, int depth) {
        String indentStr = "";
        for (int i = 0; i < depth; i++) indentStr += " ";
        System.out.println(indentStr + "A(" + alpha + "," + beta + ") at depth " + depth);
        if (game.isFinal()) {
            System.out.println(indentStr + "score: " + game.score());
            return game.score();
        }
        for (int move : Game.moves) {
            game.doMove(move);
            int score = scorePlayerB(alpha, beta, depth+1);
            game.undoMove(move);
            if (score > alpha) {
                alpha = score;
                System.out.println(indentStr + "alpha increased to " + alpha);
                if (alpha >= beta) {
                    System.out.println("beta cutoff after move " + move);
                    break;
                }
            }
        }
        System.out.println(indentStr + "-> " + alpha);
        return alpha;
    }

    public int scorePlayerB(int alpha, int beta, int depth) {
        String indentStr = "";
        for (int i = 0; i < depth; i++) indentStr += " ";
        System.out.println(indentStr + "B(" + alpha + "," + beta + ") at depth " + depth);
        if (game.isFinal()) {
            System.out.println(indentStr + "score: " + game.score());
            return game.score();
        }
        for (int move : new int[]{1, -1}) {
            game.doMove(move);
            int score = scorePlayerA(alpha, beta, depth+1);
            game.undoMove(move);
            if (score < beta) {
                beta = score;
                System.out.println(indentStr + "beta decreased to " + beta);
                if (beta <= alpha) {
                    System.out.println(indentStr + "alpha cutoff after move " + move);
                    break;
                }
            }
        }
        System.out.println(indentStr + "-> " + beta);
        return beta;
    }


    public static void main(String[] args) {
        int[] values = {2, 8, 3, 5, 4, 1};
//        int[] values = Game.randomSequence(40);
        BestDifferenceVerbose bd = new BestDifferenceVerbose(values);
        System.out.println("Final evaluation score: " + bd.alphaBeta());
    }
}
