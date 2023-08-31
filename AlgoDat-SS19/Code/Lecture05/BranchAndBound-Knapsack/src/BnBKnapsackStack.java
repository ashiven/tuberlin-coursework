import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

public class BnBKnapsackStack extends KnapsackPacker {

    public BnBKnapsackStack(Item[] items, double capacity) {
        super(items, capacity);
    }

    @Override
    public Knapsack branchAndBound() {
        Knapsack initKnapsack = initialSolution();
        double maxValue = initKnapsack.value();
        Knapsack optKnapsack = initKnapsack;

        Stack<PartialSolution> stack = new Stack<>();
        stack.push(new PartialSolution(new Knapsack(capacity), 0));
        while (!stack.isEmpty()) {
            loopruns++;
            PartialSolution psol = stack.pop();
            if (psol.knapsack.value() > maxValue) {
                optKnapsack = psol.knapsack;
                maxValue = optKnapsack.value();
            }
            if (psol.level < items.length) {
                if (bound(psol.knapsack, psol.level+1) > maxValue)
                    stack.push(new PartialSolution(psol.knapsack, psol.level+1));
                Item newItem = items[psol.level];
                if (newItem.weight <= psol.knapsack.residualCapacity) {
                    Knapsack knapsack = new Knapsack(psol.knapsack);
                    knapsack.addItem(newItem);
                    if (bound(knapsack, psol.level+1) > maxValue)
                        stack.push(new PartialSolution(knapsack, psol.level+1));
                }
            }
        }
        return new Knapsack(optKnapsack);
    }

}
