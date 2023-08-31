public class Move {
    protected Position pos;
    private int dir;
    public static final int nDirs = 8;
    private static final int[] xd = {1, 2, 2, 1, -1, -2, -2, -1};
    private static final int[] yd = {-2, -1, 1, 2, 2, 1, -1, -2};

    public Move(Position pos, int dir) {
        this.pos = new Position(pos);
        this.dir = dir;
    }

    public Position endPosition() {
        int x = pos.x + xd[dir];
        int y = pos.y + yd[dir];
        return new Position(x, y);
    }

    @Override
    public String toString() {
        return "to " + endPosition();
    }
}
