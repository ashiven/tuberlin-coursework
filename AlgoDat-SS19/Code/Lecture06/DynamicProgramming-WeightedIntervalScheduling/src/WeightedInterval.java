public class WeightedInterval {
    protected final double start;
    protected final double finish;
    protected final int weight;
    private int p;

    public WeightedInterval(double start, double finish, int weight) {
        this.start = start;
        this.finish = finish;
        this.weight = weight;
    }

    public void setP(int p) {
        this.p = p;
    }

    public int getP() {
        return p;
    }
}
