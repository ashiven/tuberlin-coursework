import java.util.LinkedList;
import java.util.Queue;

// Die Klasse ist im Prinzip dieselbe wie 'QueueWithAHole'. Der Fehler lag in
// der Klasse Position. Der einzige Unterschied ist, dass hier die Klasse PositionCorrected
// an Stelle von Position verwendet wird.

public class QueueWithAHoleCorrected {

    public static void main(String[] args) {
        Queue<PositionCorrected> queue = new LinkedList<>();
        for (int n = 0; n < 4; n++) {
            queue.add(new PositionCorrected(0, n));
        }

        for (PositionCorrected pos : queue) {
            System.out.println(pos + " ist enthalten.");
        }

        PositionCorrected p = new PositionCorrected(0, 0);
        boolean drin = queue.contains(p);
        System.out.println("Ist Position " + p + " enthalten? " + drin);
        PositionCorrected q0 = queue.peek();
        System.out.println("Ist " + q0 + " gleich " + p + "? " + q0.equals(p));
    }
}
