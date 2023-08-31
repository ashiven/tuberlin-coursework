public class Carrier extends Token {
  protected int capacity;
  protected int load;

  Carrier(int capacity) {
    super();                    // Konstruktor von Token aufrufen
    this.capacity= capacity;
  }

  public void addLoad(int deltaLoad) {
    load+= deltaLoad;
  }
}
