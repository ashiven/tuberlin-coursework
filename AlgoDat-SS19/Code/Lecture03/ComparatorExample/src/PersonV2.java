import java.util.ArrayList;
import java.util.Comparator;

// Thisprovides the same functionality as 'Person' but uses anonymous inner classes
// for comparators, as opposed to separated defined comparator classes
public class PersonV2 {
    protected String name;
    protected int age;
    protected double height;

    public PersonV2(String name, int age, double height) {
        this.name = name;
        this.age = age;
        this.height = height;
    }

    public String toString() {
        return "(" + name + ", " + age + "y, " + height + "cm)";
    }

    public static void main(String[] args) {
        ArrayList<PersonV2> personen = new ArrayList<>();
        personen.add(new PersonV2("Peter",80, 175.8));
        personen.add(new PersonV2("Paul", 81, 178.7));
        personen.add(new PersonV2("Mary", 82, 177.2));

        personen.sort(new Comparator<PersonV2>() {
            @Override
            public int compare(PersonV2 p1, PersonV2 p2) {
                return Integer.compare(p1.age, p2.age);
            }
        });
        System.out.println("Sorted by Age:\n" + personen);

        personen.sort(new Comparator<PersonV2>() {
            @Override
            public int compare(PersonV2 p1, PersonV2 p2) {
                return p1.name.compareTo(p2.name);
            }
        });
        System.out.println("Sorted by Name:\n" + personen);

        personen.sort(new Comparator<PersonV2>() {
            @Override
            public int compare(PersonV2 p1, PersonV2 p2) {
                return Double.compare(p1.height, p2.height);
            }
        });
        System.out.println("Sorted by Height:\n" + personen);

        personen.sort(new Comparator<PersonV2>() {
            @Override
            public int compare(PersonV2 p1, PersonV2 p2) {
                return -Double.compare(p1.height, p2.height);
            }
        });
        System.out.println("Descending by Height:\n" + personen);
    }
}

