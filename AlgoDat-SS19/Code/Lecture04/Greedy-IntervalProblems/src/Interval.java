public class Interval {
    private double s;
    private double f;

    public Interval(double s, double f) {
        this.s = s;
        this.f = f;
    }

    public double start() {
        return s;
    }

    public double finish() {
        return f;
    }
}
