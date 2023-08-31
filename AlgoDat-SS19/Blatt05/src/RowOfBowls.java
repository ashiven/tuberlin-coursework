import java.util.ArrayList;

public class RowOfBowls {
    int[][] matrix;
    int[] val;

    public RowOfBowls() {
    }

    public int maxGain(int[] values) {
        this.matrix = new int[values.length][values.length];
        for (int i = 0; i < values.length; i++) {
            for (int j = 0; j < values.length; j++) {
                this.matrix[j][i] = 0;
            }
        }
        this.val = new int[values.length];
        for (int i = 0; i < values.length; i++) {
            this.val[i] = values[i];
        }

        for (int i = 0; i < values.length - 1; i++) {
            for (int j = i, k = 0; k < values.length - i; j++, k++) {
                if (k == j) {
                    this.matrix[k][j] = values[k];
                } else {
                    this.matrix[k][j] = Math.max(values[k] - this.matrix[k + 1][j], values[j] - this.matrix[k][j - 1]);
                }
            }
        }
        this.matrix[0][this.val.length - 1] = Math.max(values[0] - this.matrix[1][this.val.length - 1],
                values[this.val.length - 1] - this.matrix[0][this.val.length - 2]);

        int me = 0;
        int enemy = 0;
        boolean turn = true;
        int y = 0;
        int x = values.length - 1;

        for (int k = 0; k < values.length - 1; k++) {
            if ((values[x] - this.matrix[y][x - 1]) > (values[y] - this.matrix[y + 1][x])) {
                if (turn) {
                    me += values[x];
                    turn = false;
                    x--;
                } else {
                    enemy += values[x];
                    turn = true;
                    x--;
                }
            } else {
                if (turn) {
                    me += values[y];
                    turn = false;
                    y++;
                } else {
                    enemy += values[y];
                    turn = true;
                    y++;
                }
            }
        }
        if (turn) {
            me += values[x];
        } else {
            enemy += values[x];
        }

        return (me - enemy);
    }

    public int maxGainRecursive(int[] values) {
        return maxGainRecursive2(values, 0, values.length - 1);
    }

    public int maxGainRecursive2(int[] values, int i, int j) {
        if (i == j) {
            return values[i];
        } else {
            return Math.max(values[i] - maxGainRecursive2(values, i + 1, j),
                    values[j] - maxGainRecursive2(values, i, j - 1));
        }
    }

    public Iterable<Integer> optimalSequence() {
        ArrayList<Integer> array = new ArrayList<Integer>();

        int y = 0;
        int x = this.val.length - 1;

        for (int k = 0; k < this.val.length - 1; k++) {
            if ((this.val[x] - this.matrix[y][x - 1]) > (this.val[y] - this.matrix[y + 1][x])) {
                array.add(x);
                x--;
            } else {
                array.add(y);
                y++;
            }
        }
        array.add(x);

        return array;
    }

    public static void main(String[] args) {
        RowOfBowls row = new RowOfBowls();
        int max = 0;
        ArrayList<Integer> opt = new ArrayList<Integer>();

        int[] values1 = { 4, 7, 2, 3 };
        int[] values2 = { 3, 4, 1, 2, 8, 5 };
        int[] values3 = { 2, 9, 1, 7, 4, 8 };
        int[] values4 = { 6, 1, 4, 9, 8, 5 };
        int[] values5 = { 10, 2, 10, 3, 2, 10 };
        int[] values6 = { 2, 3, 8, 5 };
        int[] values7 = { 1, 2, 3, 4, 5, 6, 7, 8 };

        max = row.maxGain(values7);

        for (int i = 0; i < row.val.length; i++) {
            System.out.print(row.val[i] + " ");
        }
        System.out.println("\n");
        for (int i = 0; i < row.val.length; i++) {
            for (int j = 0; j < row.val.length; j++) {
                System.out.print(row.matrix[i][j] + " ");
            }
            System.out.print("\n");
        }
        System.out.println("\nmaxgain: " + max + "\n");

        opt = (ArrayList) row.optimalSequence();

        for (int i = 0; i < row.val.length; i++) {
            System.out.print(opt.get(i) + " ");
        }
    }
}
