public class Item {
    public double value;
    public double weight;

    Item(double value, double weight)
    {
        this.value = value;
        this.weight = weight;
    }

    @Override
    public String toString() {
        return "item(v = " + value + ", w = " + weight + ")";
    }
}
