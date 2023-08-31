public class MinMaxBestDifference {
    private Game game;

    public MinMaxBestDifference(int[] values) {
        game = new Game(values);
    }

    public int minimax()
    {
        return scorePlayerA();
    }

    public int scorePlayerA() {
        if (game.isFinal()) {
            return game.score();
        }
        int maxScore = Integer.MIN_VALUE;
        for (int move : Game.moves) {
            game.doMove(move);
            int score = scorePlayerB();
            game.undoMove(move);
            if (score > maxScore) {
                maxScore = score;
            }
        }
        return maxScore;
    }

    public int scorePlayerB() {
        if (game.isFinal()) {
            return game.score();
        }
        int minScore = Integer.MAX_VALUE;
        for (int move : Game.moves) {
            game.doMove(move);
            int score = scorePlayerA();
            game.undoMove(move);
            if (score < minScore) {
                minScore = score;
            }
        }
        return minScore;
    }


    public static void main(String[] args) {
        int[] values = {2, 8, 3, 5, 4, 1};
//        int[] values = Game.randomSequence(20);
        MinMaxBestDifference bd = new MinMaxBestDifference(values);
        System.out.println("Score: " + bd.minimax());
    }
}
