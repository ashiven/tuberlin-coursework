public class Game {

  public static void main(String[] args) {
    Carrier traeger= new Carrier(0);
    traeger.moveTo(3, 4);
    traeger.addLoad(2);

    // Methode toString wird von Token an Carrier vererbt
    System.out.println("Stein auf " + traeger + " mit Ladung: " + traeger.load + " / " + traeger.capacity);
  }
}
