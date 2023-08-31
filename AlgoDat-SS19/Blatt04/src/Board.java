import com.sun.xml.internal.ws.model.RuntimeModelerException;

import java.util.ArrayList;
import java.util.InputMismatchException;
import java.util.Stack;

import static java.lang.Math.abs;

public class Board {
    private int n;
    int[][] bpos;
    int free;

    public Board(int n) {
        if (1 <= n && n <= 10) {
            this.n = n;
            this.bpos = new int[n][n];
            for (int i = 0; i < this.n; i++) {
                for (int j = 0; j < this.n; j++) {
                    this.bpos[i][j] = 0;
                }
            }
            this.free = nFreeFields();
        } else {
            throw new InputMismatchException("wrong dimensions");
        }
    }

    public int getN() {
        return n;
    }

    public int nFreeFields() {
        int count = 0;
        for (int i = 0; i < this.n; i++) {
            for (int j = 0; j < this.n; j++) {
                if (this.bpos[i][j] == 0) {
                    count++;
                }
            }
        }
        return count;
    }

    public int getField(Position pos) {
        if (pos.x > this.n - 1 || pos.x < 0 || pos.y > this.n - 1 || pos.y < 0) {
            throw new InputMismatchException("position not on board");
        }
        return this.bpos[pos.x][pos.y];
    }

    public void setField(Position pos, int token) {
        if (token != 1 && token != 0 && token != -1) {
            throw new RuntimeException("token not valid");
        }
        if (pos.x > this.n - 1 || pos.x < 0 || pos.y > this.n - 1 || pos.y < 0) {
            throw new InputMismatchException("position not on board");
        }
        this.bpos[pos.x][pos.y] = token;
    }

    public void doMove(Position pos, int player) {
        if (getField(pos) == 0) {
            setField(pos, player);
        }
        this.free--;
    }

    public void undoMove(Position pos) {
        setField(pos, 0);
        this.free++;
    }

    public boolean isGameWon() {
        if (this.free == (this.n) * (this.n)) {
            return false;
        }

        int counter = 0;
        int counter2 = 0;

        for (int i = 0; i < this.n - 1; i++) {
            if (this.bpos[i][i] != 0 && this.bpos[i][i] == this.bpos[i + 1][i + 1]) {
                counter++;
            }
        }
        if (counter == this.n - 1) {
            return true;
        }

        counter = 0;
        for (int j = 0; j < this.n; j++) {
            for (int k = 0; k < this.n - 1; k++) {
                if (this.bpos[j][k] != 0 && this.bpos[j][k] == this.bpos[j][k + 1]) {
                    counter++;
                }
                if (this.bpos[k][j] != 0 && this.bpos[k][j] == this.bpos[k + 1][j]) {
                    counter2++;
                }
            }
            if (counter == this.n - 1 || counter2 == this.n - 1) {
                return true;
            }
            counter = 0;
            counter2 = 0;
        }

        for (int m = 0; m < this.n; m++) {
            for (int l = 0; l < this.n; l++) {
                if (m + l == this.n - 1 && this.bpos[m][l] == 1) {
                    counter++;
                }
                if (m + l == this.n - 1 && this.bpos[m][l] == -1) {
                    counter2++;
                }
            }
        }
        if (counter == this.n || counter2 == this.n) {
            return true;
        }

        return false;
    }

    public Iterable<Position> validMoves() {
        ArrayList<Position> valid = new ArrayList<Position>();
        for (int i = 0; i < this.n; i++) {
            for (int j = 0; j < this.n; j++) {
                if (this.bpos[i][j] == 0) {
                    Position newpos = new Position(i, j);
                    valid.add(newpos);
                }
            }
        }
        return valid;
    }

    public void print() {
        for (int i = 0; i < this.n; i++) {
            for (int j = 0; j < this.n; j++) {
                System.out.println(this.bpos[j][i] + " ");
            }
            System.out.println("\n");
        }
    }

}
