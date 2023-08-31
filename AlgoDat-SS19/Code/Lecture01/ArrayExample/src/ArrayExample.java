import java.util.Arrays;

public class ArrayExample {
    public static void main(String[] args) {
        int[][] x;
        x = new int[4][3];             // Erzeugen eines 2-dim Arrays
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 3; j++)
                x[i][j] = i - j;

        // 2-dim Array ausgeben (primitive Art, siehe unten mit Array.deepToString)
        for (int i = 0; i < x.length; i++) {
            for (int j = 0; j < x[i].length; j++)
                System.out.print(String.format("%4d", x[i][j]));
            System.out.println();
        }

        // Ein nicht rechteckiges Array
        x = new int[5][];
        for (int i = 0; i < x.length; i++) {
            x[i] = new int[i + 1];
            for (int j = 0; j < x[i].length; j++)
                x[i][j] = i - j;
        }

        // 2-dim Array ausgeben (primitive Art, siehe unten mit Array.deepToString)
        System.out.println();
        for (int i = 0; i < x.length; i++) {
            for (int j = 0; j < x[i].length; j++)
                System.out.print(String.format("%4d", x[i][j]));
            System.out.println();
        }

        // Direktes Iterieren über ein Array
        double[] zahlenfolge = {12, -4, 5.6, 17};
        double sum = 0.0;
        for (double zahl : zahlenfolge)
            sum += zahl;
        System.out.println("\nx: " + Arrays.toString(zahlenfolge));
        System.out.println("sum = " + sum);

        // Direktes Iterieren über ein 2-dim Array
        sum = 0.0;
        for (int[] row : x)
            for (int element : row)
                sum += element;
        System.out.println("\nx: " + Arrays.deepToString(x));
        System.out.println("sum = " + sum);

    }
}
