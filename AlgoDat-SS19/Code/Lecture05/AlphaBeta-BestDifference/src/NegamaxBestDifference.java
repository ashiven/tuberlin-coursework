public class NegamaxBestDifference {
    private Game game;

    public NegamaxBestDifference(int[] values) {
        game = new Game(values);
    }

    public int alphaBetaNegamax()
    {
        return scorePlayer(1, -Integer.MAX_VALUE, Integer.MAX_VALUE);
    }

    public int scorePlayer(int player, int alpha, int beta) {
        if (game.isFinal()) {
            return player * game.score();
        }
        for (int move : Game.moves) {
            game.doMove(move);
            int score = - scorePlayer(-player, -beta, -alpha);
            game.undoMove(move);
            if (score > alpha) {
                alpha = score;
                if (alpha >= beta) break;
            }
        }
        return alpha;
    }

    public static void main(String[] args) {
        int[] values = {2, 8, 3, 5, 4, 1};
//        int[] values = Game.randomSequence(40);
        NegamaxBestDifference bd = new NegamaxBestDifference(values);
        System.out.println("Score: " + bd.alphaBetaNegamax());
    }
}
