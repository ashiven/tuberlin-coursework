import java.util.ArrayList;
import java.util.Collections;

public class Person implements Comparable<Person> {
    protected String name;
    protected int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "(" + name + ", " + age + "y)";
    }

    public int compareTo(Person other) {
        return Integer.compare(this.age, other.age);
    }

    public static void main(String[] args) {
        ArrayList<Person> personen = new ArrayList<>();
        personen.add(new Person("Mary", 82));
        personen.add(new Person("Peter",80));
        personen.add(new Person("Paul", 81));

        personen.sort(null);
        System.out.println("Sorted by Age:\n" + personen);

        Collections.sort(personen);
        System.out.println("Same with Collentions.sort:\n" + personen);

        Collections.sort(personen, Collections.reverseOrder());
        System.out.println("Descending by Age:\n" + personen);
    }
}
