import java.util.LinkedList;

public class Knapsack {
    private LinkedList<Item> inventory;
    protected double capacity;
    protected double residualCapacity;

    public Knapsack(double capacity) {
        this.inventory = new LinkedList<>();
        this.capacity = capacity;
        this.residualCapacity = capacity;
    }

    // copy constructor
    public Knapsack(Knapsack knapsack) {
        inventory = new LinkedList<>(knapsack.inventory);
        capacity = knapsack.capacity;
        residualCapacity = knapsack.residualCapacity;
    }

    public double value() {
        double knapsackValue = 0.0;
        for (Item item : inventory) {
            knapsackValue += item.value;
        }
        return knapsackValue;
    }

    public double weight() {
        double knapsackWeight = 0.0;
        for (Item item : inventory) {
            knapsackWeight += item.weight;
        }
        return knapsackWeight;
    }

    public void addItem(Item item) {
        inventory.push(item);
        residualCapacity -= item.weight;
    }

    public void removeItem() {
        Item item = inventory.pop();
        residualCapacity += item.weight;
    }

    @Override
    public String toString() {
        return "Knapsack(v = " + value() + ", w = " + weight() + " / " + capacity + " with " + inventory.size() + " items)";
    }

    public void print() {
        System.out.println(toString() + ":");
        for (Item item : inventory) {
            System.out.println("   " + item);
        }
    }
}
