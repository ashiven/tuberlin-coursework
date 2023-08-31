public class PositionCorrected {
    int x;
    int y;

    public PositionCorrected(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public String toString()
    {
        return "(" + x + ", " + y + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        PositionCorrected that = (PositionCorrected) o;

        if (x != that.x) return false;
        return y == that.y;

    }

//    public boolean equals(Object o) {
//        PositionCorrected that = (PositionCorrected) o;
//        return this.x == that.x && this.y == that.y;
//    }

}
