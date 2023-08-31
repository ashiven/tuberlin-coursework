import java.util.LinkedList;
import java.util.Queue;

public class BnBKnapsackQueue extends KnapsackPacker {

    public BnBKnapsackQueue(Item[] items, double capacity) {
        super(items, capacity);
    }

    @Override
    public Knapsack branchAndBound() {
        Knapsack initKnapsack = initialSolution();
        double maxValue = initKnapsack.value();
        Knapsack optKnapsack = initKnapsack;

        Queue<PartialSolution> queue = new LinkedList<>();
        queue.add(new PartialSolution(new Knapsack(capacity), 0));
        while (!queue.isEmpty()) {
            loopruns++;
            PartialSolution psol = queue.poll();
            if (psol.knapsack.value() > maxValue) {
                maxValue = psol.knapsack.value();
                optKnapsack = psol.knapsack;
            }
            if (psol.level < items.length) {
                if (bound(psol.knapsack, psol.level+1) > maxValue)
                    queue.add(new PartialSolution(psol.knapsack, psol.level+1));
                Item newItem = items[psol.level];
                if (newItem.weight <= psol.knapsack.residualCapacity) {
                    Knapsack knapsack = new Knapsack(psol.knapsack);
                    knapsack.addItem(newItem);
                    if (bound(knapsack, psol.level+1) > maxValue)
                        queue.add(new PartialSolution(knapsack, psol.level+1));
                }
            }
        }
        return optKnapsack;
    }

}
