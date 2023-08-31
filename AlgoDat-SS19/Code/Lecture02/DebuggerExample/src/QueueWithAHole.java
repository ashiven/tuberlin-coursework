import java.util.LinkedList;
import java.util.Queue;

public class QueueWithAHole {

    public static void main(String[] args) {
        Queue<Position> queue = new LinkedList<>();
        for (int n = 0; n < 4; n++) {
            queue.add(new Position(0, n));
        }

        for (Position pos : queue) {
            System.out.println(pos + " ist enthalten.");
        }

        Position p = new Position(0, 0);
        boolean drin = queue.contains(p);
        System.out.println("Ist Position " + p + " enthalten? " + drin);
        Position q0 = queue.peek();
        System.out.println("Ist " + q0 + " gleich " + p + "? " + q0.equals(p));
    }
}
