public class EditDistance {
    private String a;
    private String b;
    private int an;
    private int bn;
    private int D[][];
    private String out;

    public EditDistance(String a, String b) {
        this.a = a;
        this.b = b;
        an = a.length();
        bn = b.length();
        D = new int[an + 1][bn + 1];
        for (int i = 0; i <= an; i++) {
            D[i][0] = i;
        }
        for (int j = 0; j <= bn; j++) {
            D[0][j] = j;
        }
    }

    public int distance() {
        for (int i = 1; i <= an; i++) {
            for (int j = 1; j <= bn; j++) {
                int d1 = D[i][j - 1] + 1;
                int d2 = D[i - 1][j] + 1;
                int d3 = D[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1);
                D[i][j] = Math.min(Math.min(d1, d2), d3);
            }
        }
        return D[an][bn];
    }

    // Insert, Delete, Substitute, -: Copy
    public String commands() {
        out = "";
        edit(an, bn);
        return out;
    }

    public void edit(int i, int j) {
        if (i == 0 && j == 0) {
            return;
        } else if (i == 0) {
            edit(i, j - 1);
            out += "I";
            return;
        } else if (j == 0) {
            edit(i - 1, j);
            out += "D";
            return;
        }

        int d1 = D[i][j - 1] + 1;
        int d2 = D[i - 1][j] + 1;
        if (D[i][j] == d1) {
            edit(i, j - 1);
            out += "I";
        } else if (D[i][j] == d2) {
            edit(i - 1, j);
            out += "D";
        } else if (a.charAt(i - 1) == b.charAt(j - 1)) {
            edit(i - 1, j - 1);
            out += "-";
        } else {
            edit(i - 1, j - 1);
            out += "S";
        }
    }

    public void print() {
        for (int i = 0; i <= an; i++) {
            for (int j = 0; j <= bn; j++) {
                System.out.printf("%2d ", D[i][j]);
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        String a = "ALGODAT";
        String b = "DAGOBERT";
//    String a = "ANANAS";
//    String b = "BANANENMUS";
        EditDistance edit = new EditDistance(a, b);
        System.out.println("Edit distance of '" + a + "' and '" + b + "' is " + edit.distance());
        System.out.println("Edit command sequence: " + edit.commands());
        edit.print();
    }
}
