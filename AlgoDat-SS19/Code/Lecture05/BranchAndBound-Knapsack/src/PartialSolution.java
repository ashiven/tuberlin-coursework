public class PartialSolution {
        public Knapsack knapsack;
        public int level;

        PartialSolution(Knapsack knapsack, int level) {
            this.knapsack = knapsack;
            this.level = level;
        }

    public String toString()
    {
        return "PSol(" + knapsack + " at level = " + level + ")";
    }
}
