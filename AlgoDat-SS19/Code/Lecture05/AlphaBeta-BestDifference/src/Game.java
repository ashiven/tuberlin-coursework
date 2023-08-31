import java.util.Random;

public class Game {
    private int[] values;
    public static final int[] moves = {-1, 1};
    private int first, last;

    public Game(int[] values) {
        this.values = values;
        first = 0;
        last = values.length-1;
    }

    public void doMove(int move) {
        if (move < 0) {
            first++;
        } else {
            last--;
        }
    }

    public void undoMove(int move) {
        if (move < 0) {
            first--;
        } else {
            last++;
        }
    }

    public boolean isFinal() {
        return last - first == 1;
    }

    public int score() {
        return values[first] - values[last];
    }

    public static int[] randomSequence(int N)
    {
        Random rand = new Random();
        int[] values = new int[N];
        for (int n = 0; n < N; n++)
            values[n] = rand.nextInt(20);
        return values;
    }

}
